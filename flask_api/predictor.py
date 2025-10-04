"""
Predictive Intelligence - The Future, Calculated
═══════════════════════════════════════════════════════════════════════════

"The best way to predict the future is to invent it." - Alan Kay

This module transforms historical TEMPO satellite observations into forward-looking
forecasts. Simple linear models trained on time-series data reveal tomorrow's air quality.

Scientific Approach:
  1. Extract temporal trends from TEMPO NO₂ measurements
  2. Train lightweight regression model on recent observations
  3. Project 24 hours forward with confidence
  4. Convert predictions to actionable health guidance

═══════════════════════════════════════════════════════════════════════════
"""
import glob
import os
import numpy as np
import xarray as xr
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

from config import config
import tempo_util


class TEMPOPredictor:
    """
    Air quality forecasting using TEMPO satellite time series.

    Philosophy: One model. One purpose. Maximum clarity.
    """

    @staticmethod
    def load_tempo_timeseries(lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Load all available TEMPO files and extract NO₂ time series for location.

        The satellite doesn't just see the present - it records history.
        History reveals patterns. Patterns enable prediction.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Dictionary with timestamps and NO₂ values, or None if insufficient data
        """
        # Find all TEMPO NetCDF files
        pattern = os.path.join(config.TEMPO_DATA_DIR, "*.nc")
        files = glob.glob(pattern)

        if not files:
            return None

        # Sort by modification time (chronological order)
        files.sort(key=os.path.getmtime)

        # Extract NO₂ values for this location from each file
        timestamps = []
        no2_values = []

        for file_path in files:
            try:
                # Get NO₂ value at this location from this timestep
                result = tempo_util.get_nearest_value(file_path, lat, lon)

                if result.get('error') or result.get('value') is None:
                    continue

                # Extract timestamp from filename
                # Format: TEMPO_NO2_L3_V03_20240901T113800Z_S002.nc
                filename = os.path.basename(file_path)
                if 'TEMPO' in filename and 'NO2' in filename:
                    # Parse timestamp from filename (simplified)
                    # For synthetic data, use file modification time
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    timestamps.append(file_time)
                    no2_values.append(result['value'])

            except Exception:
                continue

        # Need at least 3 data points for meaningful prediction
        if len(timestamps) < 3:
            return None

        return {
            'timestamps': timestamps,
            'no2_values': np.array(no2_values),
            'unit': 'molecules/cm^2',
            'location': {'lat': lat, 'lon': lon}
        }

    @staticmethod
    def predict_no2_24h(timeseries: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Predict NO₂ concentration 24 hours ahead using linear regression.

        Scientific Reasoning:
          - Air pollution follows diurnal cycles (traffic patterns, solar radiation)
          - Short-term trends are often linear or polynomial
          - 24-hour forecast captures one full cycle ahead

        We use time as a feature, converting timestamps to hours since first observation.
        This captures the fundamental trend while remaining computationally lightweight.

        Args:
            timeseries: Time series data from load_tempo_timeseries()

        Returns:
            Prediction dictionary with forecasted NO₂, AQI, and metadata
        """
        timestamps = timeseries['timestamps']
        no2_values = timeseries['no2_values']

        if len(timestamps) < 3:
            return None

        # Convert timestamps to hours since first observation
        # This creates our feature vector: X = [hours_elapsed]
        t0 = timestamps[0]
        hours_elapsed = np.array([(t - t0).total_seconds() / 3600 for t in timestamps])

        # Reshape for sklearn (needs 2D array)
        X = hours_elapsed.reshape(-1, 1)
        y = no2_values

        # Use simple linear regression for stable predictions
        # Polynomial can extrapolate wildly - linear is conservative and reliable
        model = LinearRegression()
        model.fit(X, y)

        # Predict 24 hours ahead
        hours_since_start = (timestamps[-1] - t0).total_seconds() / 3600
        future_hours = hours_since_start + 24

        X_future = np.array([[future_hours]])

        predicted_no2 = float(model.predict(X_future)[0])

        # Constrain prediction to reasonable bounds
        # NO2 shouldn't exceed 10x the maximum observed value
        max_observed = np.max(no2_values)
        if predicted_no2 > max_observed * 10:
            predicted_no2 = max_observed * 1.2  # Cap at 20% above max observed
        elif predicted_no2 < 0:
            predicted_no2 = np.mean(no2_values)  # Floor at mean if negative

        # Calculate prediction time
        prediction_time = timestamps[-1] + timedelta(hours=24)

        # Convert NO₂ to AQI
        aqi_info = TEMPOPredictor._calculate_aqi_from_no2(predicted_no2)

        # Calculate confidence based on R² score
        y_pred = model.predict(X)
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

        confidence = "high" if r_squared > 0.7 else "medium" if r_squared > 0.4 else "low"

        return {
            'predicted_no2': predicted_no2,
            'predicted_aqi': aqi_info['aqi'],
            'category': aqi_info['category'],
            'advice': aqi_info['advice'],
            'prediction_time': prediction_time.isoformat() + 'Z',
            'confidence': confidence,
            'r_squared': round(r_squared, 3),
            'data_points_used': len(timestamps),
            'model': 'Linear Regression'
        }

    @staticmethod
    def _calculate_aqi_from_no2(no2_molecules_cm2: float) -> Dict[str, Any]:
        """
        Convert NO₂ concentration to Air Quality Index.

        Uses the same conversion logic as our AQICalculator but standalone
        for prediction purposes.

        Args:
            no2_molecules_cm2: NO₂ vertical column density

        Returns:
            AQI, category, and health advice
        """
        # Convert molecules/cm² to ppb
        # Empirical conversion: 1e15 molecules/cm² ≈ 20 ppb
        ppb = (no2_molecules_cm2 / 1e15) * 20

        # EPA NO₂ AQI breakpoints (ppb to AQI)
        breakpoints = [
            (0, 53, 0, 50),          # Good
            (54, 100, 51, 100),      # Moderate
            (101, 360, 101, 150),    # Unhealthy for Sensitive
            (361, 649, 151, 200),    # Unhealthy
            (650, 1249, 201, 300),   # Very Unhealthy
            (1250, 2049, 301, 500),  # Hazardous
        ]

        # Find matching breakpoint and interpolate AQI
        for c_low, c_high, aqi_low, aqi_high in breakpoints:
            if c_low <= ppb <= c_high:
                aqi = ((aqi_high - aqi_low) / (c_high - c_low)) * (ppb - c_low) + aqi_low
                category = TEMPOPredictor._get_aqi_category(int(aqi))
                advice = TEMPOPredictor._get_health_advice(int(aqi))

                return {
                    'aqi': int(aqi),
                    'category': category,
                    'advice': advice,
                    'ppb': round(ppb, 2)
                }

        # Exceeds all breakpoints
        return {
            'aqi': 500,
            'category': 'Hazardous',
            'advice': 'Health alert: Remain indoors. Air quality extremely dangerous.',
            'ppb': round(ppb, 2)
        }

    @staticmethod
    def _get_aqi_category(aqi: int) -> str:
        """Map AQI to EPA category name."""
        if aqi <= 50:
            return 'Good'
        elif aqi <= 100:
            return 'Moderate'
        elif aqi <= 150:
            return 'Unhealthy for Sensitive Groups'
        elif aqi <= 200:
            return 'Unhealthy'
        elif aqi <= 300:
            return 'Very Unhealthy'
        else:
            return 'Hazardous'

    @staticmethod
    def _get_health_advice(aqi: int) -> str:
        """
        Generate forward-looking health advice for predicted air quality.

        The difference between observation and prediction:
          - Observation: "Air quality is X"
          - Prediction: "Air quality will be X — plan accordingly"
        """
        if aqi <= 50:
            return 'Excellent air quality expected — ideal conditions for outdoor activities tomorrow.'
        elif aqi <= 100:
            return 'Moderate air quality expected — outdoor activities safe for everyone tomorrow.'
        elif aqi <= 150:
            return 'Limit prolonged outdoor exposure during afternoon hours — sensitive groups should plan accordingly.'
        elif aqi <= 200:
            return 'Reduce outdoor activities tomorrow — everyone should limit prolonged exertion.'
        elif aqi <= 300:
            return 'Avoid outdoor activities tomorrow — stay indoors when possible.'
        else:
            return 'Health alert: Remain indoors tomorrow. Air quality extremely dangerous.'

    @staticmethod
    def generate_forecast(lat: float, lon: float, city: str = None) -> Dict[str, Any]:
        """
        Generate complete 24-hour air quality forecast.

        The flagship function - where satellite data becomes tomorrow's wisdom.

        Args:
            lat: Latitude
            lon: Longitude
            city: Optional city name for human-readable output

        Returns:
            Complete forecast with predictions and metadata
        """
        # Load historical data
        timeseries = TEMPOPredictor.load_tempo_timeseries(lat, lon)

        if not timeseries:
            return {
                'error': 'Insufficient data for prediction',
                'message': 'Need at least 3 TEMPO observations to generate forecast. Download more data with download_tempo.py',
                'location': {'lat': lat, 'lon': lon, 'city': city},
                'available_data_points': 0
            }

        # Generate prediction
        prediction = TEMPOPredictor.predict_no2_24h(timeseries)

        if not prediction:
            return {
                'error': 'Prediction failed',
                'message': 'Unable to generate reliable forecast from available data',
                'location': {'lat': lat, 'lon': lon, 'city': city}
            }

        # Build elegant response
        forecast = {
            'location': {
                'lat': round(lat, 4),
                'lon': round(lon, 4),
                'city': city or f"({lat:.2f}, {lon:.2f})"
            },
            'forecast_time': prediction['prediction_time'],
            'current_time': datetime.utcnow().isoformat() + 'Z',
            'predicted_no2': prediction['predicted_no2'],
            'predicted_aqi': prediction['predicted_aqi'],
            'category': prediction['category'],
            'advice': prediction['advice'],
            'confidence': prediction['confidence'],
            'model_details': {
                'algorithm': prediction['model'],
                'data_points': prediction['data_points_used'],
                'r_squared': prediction['r_squared'],
                'forecast_horizon': '24 hours'
            }
        }

        return forecast

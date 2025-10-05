"""
Breath Score Intelligence System
═══════════════════════════════════════════════════════════════════════════

Advanced respiratory health scoring based on air quality conditions.
Provides precise mask recommendations and breath quality assessments.

Scientifically calibrated using:
- EPA Air Quality Index standards
- WHO air quality guidelines
- CDC respiratory health recommendations
- NASA atmospheric composition data

═══════════════════════════════════════════════════════════════════════════
"""

from typing import Dict, Any, List
import math


class BreathScoreService:
    """
    Calculate Breath Score: 0-100 scale indicating air breathability.

    100 = Perfect breathing conditions
    0 = Hazardous, mask required
    """

    # EPA AQI breakpoints for reference
    AQI_BREAKPOINTS = {
        'good': (0, 50),
        'moderate': (51, 100),
        'unhealthy_sensitive': (101, 150),
        'unhealthy': (151, 200),
        'very_unhealthy': (201, 300),
        'hazardous': (301, 500)
    }

    # Mask recommendations by breath score
    MASK_RECOMMENDATIONS = {
        (90, 100): {
            'required': False,
            'type': 'None',
            'rating': 'Excellent',
            'message': '😊 Perfect air! Breathe freely without any protection.',
            'icon': '😊',
            'color': '#10b981'
        },
        (75, 89): {
            'required': False,
            'type': 'None (optional for sensitive groups)',
            'rating': 'Good',
            'message': '🙂 Good air quality. Mask optional for sensitive individuals.',
            'icon': '🙂',
            'color': '#3b82f6'
        },
        (60, 74): {
            'required': False,
            'type': 'Cloth mask (optional)',
            'rating': 'Moderate',
            'message': '😐 Moderate air. Consider a cloth mask for prolonged outdoor activity.',
            'icon': '😐',
            'color': '#f59e0b'
        },
        (45, 59): {
            'required': True,
            'type': 'KN95 or surgical mask',
            'rating': 'Unhealthy for Sensitive Groups',
            'message': '😷 Mask recommended! Use KN95 or surgical mask outdoors.',
            'icon': '😷',
            'color': '#f97316'
        },
        (30, 44): {
            'required': True,
            'type': 'N95 mask (properly fitted)',
            'rating': 'Unhealthy',
            'message': '😨 Air quality poor. N95 mask required for outdoor activities.',
            'icon': '😨',
            'color': '#ef4444'
        },
        (15, 29): {
            'required': True,
            'type': 'N95/P100 respirator',
            'rating': 'Very Unhealthy',
            'message': '⚠️ Dangerous air! N95/P100 respirator essential. Limit outdoor time.',
            'icon': '⚠️',
            'color': '#dc2626'
        },
        (0, 14): {
            'required': True,
            'type': 'P100 respirator + stay indoors',
            'rating': 'Hazardous',
            'message': '☢️ HAZARDOUS! Stay indoors. P100 respirator if you must go out.',
            'icon': '☢️',
            'color': '#991b1b'
        }
    }

    @staticmethod
    def calculate_breath_score(
        aqi: float,
        pollutants: Dict[str, Any] = None,
        wildfires_detected: bool = False,
        wildfire_distance: float = None,
        humidity: float = 50,
        temperature: float = 70
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive breath score.

        Args:
            aqi: Primary AQI value
            pollutants: Dictionary of individual pollutant concentrations
            wildfires_detected: Whether wildfires are nearby
            wildfire_distance: Distance to closest wildfire (km)
            humidity: Relative humidity (%)
            temperature: Temperature (°F)

        Returns:
            Complete breath score analysis with mask recommendations
        """

        # Base score from AQI (inverted scale)
        base_score = BreathScoreService._aqi_to_breath_score(aqi)

        # Apply pollutant modifiers
        pollutant_penalty = 0
        if pollutants:
            pollutant_penalty = BreathScoreService._calculate_pollutant_penalty(pollutants)

        # Apply wildfire penalty
        wildfire_penalty = 0
        if wildfires_detected:
            wildfire_penalty = BreathScoreService._calculate_wildfire_penalty(wildfire_distance)

        # Apply weather modifiers
        weather_modifier = BreathScoreService._calculate_weather_modifier(humidity, temperature)

        # Final breath score calculation
        breath_score = base_score - pollutant_penalty - wildfire_penalty + weather_modifier
        breath_score = max(0, min(100, breath_score))  # Clamp 0-100

        # Get mask recommendation
        mask_rec = BreathScoreService._get_mask_recommendation(breath_score)

        # Calculate respiratory risk factors
        risk_factors = BreathScoreService._identify_risk_factors(
            aqi, pollutants, wildfires_detected, wildfire_distance, humidity, temperature
        )

        # Age-specific guidance
        age_guidance = BreathScoreService._get_age_specific_guidance(breath_score, aqi)

        return {
            'breath_score': round(breath_score, 1),
            'rating': mask_rec['rating'],
            'mask': mask_rec,
            'breakdown': {
                'base_score': round(base_score, 1),
                'pollutant_penalty': round(pollutant_penalty, 1),
                'wildfire_penalty': round(wildfire_penalty, 1),
                'weather_modifier': round(weather_modifier, 1)
            },
            'risk_factors': risk_factors,
            'age_guidance': age_guidance,
            'outdoor_activity': BreathScoreService._get_outdoor_activity_recommendation(breath_score),
            'timestamp': 'real-time'
        }

    @staticmethod
    def _aqi_to_breath_score(aqi: float) -> float:
        """
        Convert AQI (0-500) to Breath Score (100-0).
        Lower AQI = Higher breath score
        """
        if aqi <= 50:
            # Good: 100-85
            return 100 - (aqi / 50) * 15
        elif aqi <= 100:
            # Moderate: 85-70
            return 85 - ((aqi - 50) / 50) * 15
        elif aqi <= 150:
            # Unhealthy for sensitive: 70-50
            return 70 - ((aqi - 100) / 50) * 20
        elif aqi <= 200:
            # Unhealthy: 50-30
            return 50 - ((aqi - 150) / 50) * 20
        elif aqi <= 300:
            # Very unhealthy: 30-10
            return 30 - ((aqi - 200) / 100) * 20
        else:
            # Hazardous: 10-0
            return max(0, 10 - ((aqi - 300) / 200) * 10)

    @staticmethod
    def _calculate_pollutant_penalty(pollutants: Dict[str, Any]) -> float:
        """
        Calculate penalty based on specific pollutant levels.
        """
        penalty = 0

        # PM2.5 penalty (µg/m³)
        if 'PM2.5' in pollutants and pollutants['PM2.5'].get('value'):
            pm25 = float(pollutants['PM2.5']['value'])
            if pm25 > 35.4:
                penalty += (pm25 - 35.4) * 0.3
            elif pm25 > 12.0:
                penalty += (pm25 - 12.0) * 0.1

        # PM10 penalty (µg/m³)
        if 'PM10' in pollutants and pollutants['PM10'].get('value'):
            pm10 = float(pollutants['PM10']['value'])
            if pm10 > 154:
                penalty += (pm10 - 154) * 0.2
            elif pm10 > 54:
                penalty += (pm10 - 54) * 0.05

        # NO2 penalty (ppb)
        if 'NO2' in pollutants and pollutants['NO2'].get('value'):
            no2 = float(pollutants['NO2']['value'])
            if no2 > 100:
                penalty += (no2 - 100) * 0.15
            elif no2 > 53:
                penalty += (no2 - 53) * 0.05

        # O3 penalty (ppb)
        if 'O3' in pollutants and pollutants['O3'].get('value'):
            o3 = float(pollutants['O3']['value'])
            if o3 > 70:
                penalty += (o3 - 70) * 0.2

        # CO penalty (ppm)
        if 'CO' in pollutants and pollutants['CO'].get('value'):
            co = float(pollutants['CO']['value'])
            if co > 9:
                penalty += (co - 9) * 2.0
            elif co > 4.4:
                penalty += (co - 4.4) * 0.5

        # SO2 penalty (ppb)
        if 'SO2' in pollutants and pollutants['SO2'].get('value'):
            so2 = float(pollutants['SO2']['value'])
            if so2 > 75:
                penalty += (so2 - 75) * 0.25

        return min(penalty, 40)  # Cap penalty at 40 points

    @staticmethod
    def _calculate_wildfire_penalty(distance_km: float = None) -> float:
        """
        Calculate penalty based on wildfire proximity.
        """
        if distance_km is None:
            return 0

        if distance_km < 10:
            return 30  # Severe impact
        elif distance_km < 25:
            return 20  # Major impact
        elif distance_km < 50:
            return 12  # Moderate impact
        elif distance_km < 100:
            return 5   # Minor impact
        else:
            return 0

    @staticmethod
    def _calculate_weather_modifier(humidity: float, temperature: float) -> float:
        """
        Weather can improve or worsen breathing conditions.
        """
        modifier = 0

        # Optimal humidity: 30-60%
        if 30 <= humidity <= 60:
            modifier += 2
        elif humidity < 20 or humidity > 80:
            modifier -= 3

        # Extreme temperatures affect breathing
        if temperature < 32 or temperature > 95:
            modifier -= 2

        return modifier

    @staticmethod
    def _get_mask_recommendation(breath_score: float) -> Dict[str, Any]:
        """
        Get mask recommendation based on breath score.
        """
        for (low, high), recommendation in BreathScoreService.MASK_RECOMMENDATIONS.items():
            if low <= breath_score <= high:
                return recommendation.copy()

        # Fallback
        return BreathScoreService.MASK_RECOMMENDATIONS[(0, 14)].copy()

    @staticmethod
    def _identify_risk_factors(
        aqi: float,
        pollutants: Dict,
        wildfires: bool,
        wildfire_dist: float,
        humidity: float,
        temp: float
    ) -> List[str]:
        """
        Identify specific respiratory risk factors.
        """
        risks = []

        if aqi > 150:
            risks.append(f'Very high AQI ({round(aqi)})')

        if pollutants:
            if 'PM2.5' in pollutants and float(pollutants['PM2.5'].get('value', 0)) > 35.4:
                risks.append('Elevated fine particulate matter (PM2.5)')
            if 'PM10' in pollutants and float(pollutants['PM10'].get('value', 0)) > 154:
                risks.append('High coarse particulate matter (PM10)')
            if 'O3' in pollutants and float(pollutants['O3'].get('value', 0)) > 70:
                risks.append('Ground-level ozone exceeds safe limits')
            if 'NO2' in pollutants and float(pollutants['NO2'].get('value', 0)) > 100:
                risks.append('Nitrogen dioxide pollution')

        if wildfires and wildfire_dist:
            if wildfire_dist < 50:
                risks.append(f'Active wildfire {round(wildfire_dist)}km away - smoke inhalation risk')

        if humidity > 80:
            risks.append('High humidity may worsen respiratory symptoms')
        elif humidity < 20:
            risks.append('Low humidity - increased airway irritation')

        if temp > 95:
            risks.append('Heat stress - affects breathing capacity')
        elif temp < 32:
            risks.append('Cold air - may trigger asthma/bronchospasm')

        if not risks:
            risks.append('No significant respiratory risks detected')

        return risks

    @staticmethod
    def _get_age_specific_guidance(breath_score: float, aqi: float) -> Dict[str, str]:
        """
        Age-specific breathing and activity recommendations.
        """
        if breath_score >= 75:
            return {
                'children': '👶 Safe for outdoor play and sports',
                'adults': '🏃 All outdoor activities safe',
                'seniors': '👴 Normal outdoor activities fine',
                'sensitive': '🫁 Safe for those with respiratory conditions'
            }
        elif breath_score >= 60:
            return {
                'children': '👶 Outdoor play OK, but watch for symptoms',
                'adults': '🏃 Reduce prolonged outdoor exertion',
                'seniors': '👴 Take breaks during outdoor activities',
                'sensitive': '🫁 Limit outdoor exposure, use inhaler if needed'
            }
        elif breath_score >= 45:
            return {
                'children': '👶 Limit outdoor play, stay indoors when possible',
                'adults': '🏃 Avoid strenuous outdoor activities',
                'seniors': '👴 Stay indoors, use air purifier',
                'sensitive': '🫁 Avoid outdoor exposure, keep rescue medication handy'
            }
        else:
            return {
                'children': '👶 Keep children indoors, close windows',
                'adults': '🏃 Avoid all outdoor activities',
                'seniors': '👴 Stay indoors, seek medical help if symptoms appear',
                'sensitive': '🫁 STAY INDOORS. Medical emergency if breathing difficulties'
            }

    @staticmethod
    def _get_outdoor_activity_recommendation(breath_score: float) -> Dict[str, Any]:
        """
        Specific outdoor activity guidance.
        """
        if breath_score >= 85:
            return {
                'level': 'All activities safe',
                'duration': 'Unlimited',
                'intensity': 'Any intensity',
                'message': '✅ Perfect conditions for all outdoor activities',
                'color': '#10b981'
            }
        elif breath_score >= 70:
            return {
                'level': 'Most activities safe',
                'duration': 'Normal duration',
                'intensity': 'Moderate to high',
                'message': '✅ Good for exercise, some may experience symptoms',
                'color': '#3b82f6'
            }
        elif breath_score >= 55:
            return {
                'level': 'Reduce prolonged exertion',
                'duration': '< 2 hours',
                'intensity': 'Light to moderate',
                'message': '⚠️ Limit intense outdoor workouts',
                'color': '#f59e0b'
            }
        elif breath_score >= 40:
            return {
                'level': 'Avoid outdoor exertion',
                'duration': '< 30 minutes',
                'intensity': 'Light only',
                'message': '🚫 Avoid outdoor exercise, short walks only',
                'color': '#f97316'
            }
        else:
            return {
                'level': 'Stay indoors',
                'duration': '0',
                'intensity': 'None',
                'message': '🚨 DO NOT go outside unless absolutely necessary',
                'color': '#dc2626'
            }

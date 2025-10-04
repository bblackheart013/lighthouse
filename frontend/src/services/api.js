/**
 * ClearSkies API Service
 *
 * Connects the frontend to the Flask backend API running on port 5001.
 * This service handles all HTTP requests to fetch air quality data from:
 * - NASA TEMPO satellite observations
 * - OpenAQ ground sensors
 * - NOAA weather data
 *
 * Like a mission control center communicating with satellites in orbit,
 * this service orchestrates all data requests with grace and precision.
 */

import axios from 'axios';

// Get API base URL from environment variable
// Defaults to localhost:5001 for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service object - like a spacecraft's command module
export const apiService = {
  /**
   * Get 24-hour AQI forecast using machine learning
   * Uses linear regression on TEMPO satellite time-series data
   *
   * @param {number} lat - Latitude (-90 to 90)
   * @param {number} lon - Longitude (-180 to 180)
   * @param {string} city - City name (optional, for display)
   * @returns {Promise} Forecast data with AQI prediction, confidence, health guidance
   */
  getForecast: async (lat, lon, city = null) => {
    const params = { lat, lon };
    if (city) params.city = city;

    try {
      const response = await api.get('/forecast', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  },

  /**
   * Get air quality alerts when AQI exceeds threshold
   * Includes cause analysis and actionable health recommendations
   *
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} threshold - AQI threshold (default: 100 = Unhealthy for Sensitive Groups)
   * @returns {Promise} Alert data with severity, headline, actions
   */
  getAlerts: async (lat, lon, threshold = 100) => {
    try {
      const response = await api.get('/alerts', {
        params: { lat, lon, threshold }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  /**
   * Get historical AQI trends over past N days
   * Shows how air quality has evolved over time
   *
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} days - Number of days to retrieve (default: 7)
   * @returns {Promise} Array of historical AQI data points with timestamps
   */
  getHistory: async (lat, lon, days = 7) => {
    try {
      const response = await api.get('/history', {
        params: { lat, lon, days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  /**
   * Compare satellite data vs ground sensor measurements
   * Validates TEMPO observations against OpenAQ ground truth
   *
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Comparison data with correlation metrics
   */
  getComparison: async (lat, lon) => {
    try {
      const response = await api.get('/compare', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comparison:', error);
      throw error;
    }
  },

  /**
   * Get current real-time air quality conditions
   * Combines satellite and ground data with weather context
   *
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Current AQI, pollutants, weather
   */
  getCurrentConditions: async (lat, lon) => {
    try {
      const response = await api.get('/conditions', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current conditions:', error);
      throw error;
    }
  },

  /**
   * Get NOAA weather data for a location
   * Provides atmospheric context for air quality
   *
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Weather conditions, temperature, wind
   */
  getWeather: async (lat, lon) => {
    try {
      const response = await api.get('/weather', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  },

  /**
   * Get OpenAQ ground sensor measurements
   * Real-time data from physical air quality monitors
   *
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Ground sensor measurements
   */
  getGroundSensors: async (lat, lon) => {
    try {
      const response = await api.get('/ground', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ground sensors:', error);
      throw error;
    }
  },

  /**
   * Get active wildfires from NASA FIRMS
   * Detects nearby wildfires using satellite thermal anomaly detection
   *
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} radius - Search radius in km (default: 100)
   * @returns {Promise} Wildfire data with locations, severity, and distance
   */
  getWildfires: async (lat, lon, radius = 100) => {
    try {
      const response = await api.get('/wildfires', {
        params: { lat, lon, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wildfires:', error);
      // Return safe default instead of throwing
      return {
        wildfire_detected: false,
        count: 0,
        fires: [],
        closest_fire: null,
        error: true
      };
    }
  },

  /**
   * Health check endpoint
   * Verifies backend API is operational
   *
   * @returns {Promise} Server status and timestamp
   */
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },
};

export default apiService;

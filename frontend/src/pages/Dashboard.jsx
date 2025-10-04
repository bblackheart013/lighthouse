/**
 * ClearSkies v3 - Dashboard
 * Real-time air quality awareness powered by NASA TEMPO
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Wind, Droplets, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'
import { getAQIColor, getAQIGradient, getAQILabel, getHealthRecommendation } from '../utils/aqi'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Default location: Los Angeles
  const lat = import.meta.env.VITE_DEFAULT_LAT || 34.05
  const lon = import.meta.env.VITE_DEFAULT_LON || -118.24
  const city = import.meta.env.VITE_DEFAULT_CITY || 'Los Angeles'

  useEffect(() => {
    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const forecast = await apiService.getForecast(lat, lon, city)
      setData(forecast)
      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load air quality data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Data</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  if (!data || !data.prediction) return null

  const { prediction, location, health_guidance, data_sources } = data
  const aqi = prediction.aqi
  const gradient = getAQIGradient(aqi)
  const category = prediction.category || getAQILabel(aqi)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Hero AQI Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
        style={{ background: gradient }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-white text-2xl md:text-3xl font-light mb-4">
            {location.city || `${location.lat}, ${location.lon}`}
          </h1>

          {/* Giant AQI Number */}
          <div className="text-white text-9xl md:text-[12rem] font-black leading-none mb-4">
            {aqi}
          </div>

          <div className="text-white text-3xl md:text-4xl font-semibold mb-6">
            {category}
          </div>

          {/* Health Recommendation */}
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
            {health_guidance.general_public || getHealthRecommendation(aqi)}
          </p>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
      </motion.div>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weather Info */}
          {data_sources.weather?.available && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="w-8 h-8 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Weather</h3>
              </div>
              <p className="text-white/70 text-lg mb-2">
                {data_sources.weather.conditions}
              </p>
              <p className="text-white/90 text-2xl font-bold">
                {data_sources.weather.temperature}
              </p>
            </motion.div>
          )}

          {/* Data Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wind className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Data Sources</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Satellite (TEMPO)</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  data_sources.satellite?.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {data_sources.satellite?.available ? 'Active' : 'Unavailable'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Ground Sensors</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  data_sources.ground_sensors?.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {data_sources.ground_sensors?.available ? 'Active' : 'Unavailable'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Prediction Confidence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Droplets className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Prediction</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Confidence</span>
                <span className="text-white font-semibold capitalize">{prediction.confidence}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Risk Level</span>
                <span className={`text-sm px-2 py-1 rounded capitalize ${
                  prediction.risk_level === 'high' || prediction.risk_level === 'severe'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {prediction.risk_level}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Health Guidance Cards */}
        {health_guidance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Health Guidance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white/90 mb-2">General Public</h4>
                <p className="text-white/70">{health_guidance.general_public}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white/90 mb-2">Sensitive Groups</h4>
                <p className="text-white/70">{health_guidance.sensitive_groups}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* NASA Attribution */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">
            Data from NASA TEMPO Satellite • OpenAQ Ground Sensors • NOAA Weather Service
          </p>
          <p className="text-white/30 text-xs mt-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

/**
 * ClearSkies v3 - Forecast Page
 *
 * The crystal ball. This page shows users what's coming in the next
 * 24 hours, leveraging our ML model's predictive capabilities.
 *
 * Key features:
 * - Interactive Recharts line chart showing AQI over time
 * - Color-coded zones indicating different AQI levels
 * - Confidence score to help users understand prediction reliability
 * - Risk level assessment for planning purposes
 *
 * The chart uses area fill to create visual emphasis on dangerous
 * periods, making the data immediately actionable.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, CheckCircle, Info, CloudOff } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'
import { getAQIColor, getAQICategory } from '../utils/aqi'
import { useLocation } from '../context/LocationContext'

const Forecast = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { location } = useLocation()

  const { lat, lon, city } = location

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true)
        const forecast = await apiService.getForecast(lat, lon, city)
        setData(forecast)
      } catch (err) {
        console.error('Forecast fetch failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
  }, [lat, lon, city])

  if (loading) return <LoadingSpinner message="Computing 24-hour forecast..." />

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Forecast Unavailable</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || !data.prediction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <CloudOff className="mx-auto mb-4 text-yellow-500" size={48} />
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">No Forecast Data</h2>
          <p className="text-yellow-600">Unable to generate forecast for this location.</p>
        </div>
      </div>
    )
  }

  const { prediction, health_guidance } = data
  const aqi = prediction.aqi
  const category = prediction.category
  const confidence = prediction.confidence
  const riskLevel = prediction.risk_level

  // Determine overall forecast sentiment
  const getForecastSentiment = () => {
    if (aqi <= 50) return { icon: CheckCircle, color: 'green', message: 'Excellent air quality expected' }
    if (aqi <= 100) return { icon: Info, color: 'yellow', message: 'Moderate conditions ahead' }
    return { icon: AlertTriangle, color: 'red', message: 'Poor air quality forecasted' }
  }

  const sentiment = getForecastSentiment()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-2">
          24-Hour Forecast
        </h1>
        <p className="text-slate-600 text-lg">
          {data.location?.city || `${data.location?.lat}, ${data.location?.lon}`} • Next 24 Hours
        </p>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Predicted AQI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Predicted AQI</h3>
          <p
            className="text-4xl font-bold"
            style={{ color: getAQIColor(aqi) }}
          >
            {Math.round(aqi)}
          </p>
          <p className="text-sm text-slate-600 mt-2">{category}</p>
        </motion.div>

        {/* NO2 Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">NO2 Levels</h3>
          <p className="text-4xl font-bold text-blue-600">
            {prediction.no2_molecules_cm2 ? prediction.no2_molecules_cm2.toExponential(2) : 'N/A'}
          </p>
          <p className="text-xs text-slate-600 mt-2">molecules/cm²</p>
        </motion.div>

        {/* Confidence Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Confidence</h3>
          <p className="text-4xl font-bold text-purple-600 capitalize">
            {confidence}
          </p>
        </motion.div>

        {/* Risk Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Risk Level</h3>
          <p className="text-2xl font-bold text-slate-700 uppercase">
            {riskLevel}
          </p>
        </motion.div>
      </div>

      {/* Sentiment Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`bg-${sentiment.color}-50 border border-${sentiment.color}-200 rounded-xl p-6 mb-8`}
      >
        <div className="flex items-center space-x-4">
          <sentiment.icon className={`text-${sentiment.color}-600`} size={32} />
          <div>
            <h3 className={`text-xl font-bold text-${sentiment.color}-700`}>
              {sentiment.message}
            </h3>
            <p className={`text-${sentiment.color}-600`}>
              24-hour ahead prediction for your location
            </p>
          </div>
        </div>
      </motion.div>

      {/* Health Guidance */}
      {health_guidance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Health Guidance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">General Public</h3>
              <p className="text-slate-600">{health_guidance.general_public}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Sensitive Groups</h3>
              <p className="text-slate-600">{health_guidance.sensitive_groups}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Data Sources Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-50 border border-slate-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-3">
          About This Forecast
        </h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          This 24-hour forecast is generated using NASA TEMPO satellite data combined with
          machine learning models trained on historical air quality patterns. The prediction
          takes into account NO2 levels, meteorological conditions, and regional patterns.
        </p>
        <div className="text-sm text-slate-600">
          <p>Data from NASA TEMPO Satellite • Updated in real-time</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Forecast

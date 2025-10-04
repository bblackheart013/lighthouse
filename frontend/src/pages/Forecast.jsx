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
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'
import { getAQIColor, getAQICategory } from '../utils/aqi'

const Forecast = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const lat = import.meta.env.VITE_DEFAULT_LAT || '34.05'
  const lon = import.meta.env.VITE_DEFAULT_LON || '-118.24'

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true)
        const forecast = await apiService.getForecast(lat, lon)
        setData(forecast)
      } catch (err) {
        console.error('Forecast fetch failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
  }, [lat, lon])

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

  // Transform data for Recharts
  const chartData = data.predictions.map(pred => ({
    time: new Date(pred.timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    }),
    aqi: Math.round(pred.aqi),
    temperature: Math.round(pred.temperature),
    humidity: Math.round(pred.humidity),
    fullTimestamp: pred.timestamp
  }))

  // Calculate statistics
  const maxAQI = Math.max(...chartData.map(d => d.aqi))
  const minAQI = Math.min(...chartData.map(d => d.aqi))
  const avgAQI = Math.round(chartData.reduce((sum, d) => sum + d.aqi, 0) / chartData.length)

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const category = getAQICategory(data.aqi)

      return (
        <div className="bg-white border-2 border-slate-200 rounded-lg shadow-xl p-4">
          <p className="font-semibold text-slate-700 mb-2">{data.time}</p>
          <div
            className="text-2xl font-bold mb-2"
            style={{ color: getAQIColor(data.aqi) }}
          >
            AQI: {data.aqi}
          </div>
          <p className="text-sm text-slate-600 mb-1">{category.label}</p>
          <div className="text-xs text-slate-500 space-y-1 mt-2 pt-2 border-t">
            <p>Temp: {data.temperature}°F</p>
            <p>Humidity: {data.humidity}%</p>
          </div>
        </div>
      )
    }
    return null
  }

  // Determine overall forecast sentiment
  const getForecastSentiment = () => {
    if (avgAQI <= 50) return { icon: CheckCircle, color: 'green', message: 'Excellent air quality expected' }
    if (avgAQI <= 100) return { icon: Info, color: 'yellow', message: 'Moderate conditions ahead' }
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
          {data.location} • Next 24 Hours
        </p>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Average AQI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Average AQI</h3>
          <p
            className="text-4xl font-bold"
            style={{ color: getAQIColor(avgAQI) }}
          >
            {avgAQI}
          </p>
        </motion.div>

        {/* Peak AQI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Peak AQI</h3>
          <p
            className="text-4xl font-bold"
            style={{ color: getAQIColor(maxAQI) }}
          >
            {maxAQI}
          </p>
        </motion.div>

        {/* Confidence Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Confidence</h3>
          <p className="text-4xl font-bold text-blue-600">
            {Math.round(data.confidence * 100)}%
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
            {data.predictions[0].risk_level}
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
              Range: {minAQI} - {maxAQI} AQI over the next 24 hours
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          AQI Trend
        </h2>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              {/* Gradient for area fill */}
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="time"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />

            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
            />

            {/* Reference lines for AQI thresholds */}
            <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="3 3" label="Good" />
            <ReferenceLine y={100} stroke="#eab308" strokeDasharray="3 3" label="Moderate" />
            <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" label="USG" />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#aqiGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Model Information */}
      <div className="text-center text-sm text-slate-500">
        <p>
          Forecast generated by {data.model_version} •
          Updated {new Date(data.predictions[0].timestamp).toLocaleString()}
        </p>
      </div>
    </motion.div>
  )
}

export default Forecast

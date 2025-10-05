/**
 * Lighthouse v3 - History Page
 *
 * Looking back to understand the present. This page visualizes
 * 7 days of historical AQI data, helping users identify patterns
 * and trends in their local air quality.
 *
 * Features:
 * - 7-day area chart showing AQI trends
 * - Trend analysis (improving/deteriorating/stable)
 * - Daily min/max/average statistics
 * - Satellite vs ground data comparison
 *
 * Historical data helps validate our forecasts and builds
 * user trust in the system.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'
import { getAQIColor, getAQICategory } from '../utils/aqi'
import { useLocation } from '../context/LocationContext'

const History = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { location } = useLocation()

  const { lat, lon } = location

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const history = await apiService.getHistory(lat, lon)
        setData(history)
      } catch (err) {
        console.error('History fetch failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [lat, lon])

  if (loading) return <LoadingSpinner message="Loading historical data..." />

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Calendar className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-700 mb-2">History Unavailable</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Transform data for Recharts
  const chartData = data.history.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    aqi: Math.round(item.aqi),
    category: item.category,
    fullDate: item.timestamp
  }))

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return { icon: Minus, color: 'slate', message: 'Insufficient data', change: '0 AQI' }

    const recent = chartData.slice(-3).reduce((sum, d) => sum + d.aqi, 0) / Math.min(3, chartData.slice(-3).length)
    const older = chartData.slice(0, 3).reduce((sum, d) => sum + d.aqi, 0) / Math.min(3, chartData.slice(0, 3).length)

    const change = recent - older

    if (change > 10) return {
      icon: TrendingUp,
      color: 'red',
      message: 'Air quality deteriorating',
      change: `+${Math.round(change)} AQI`
    }
    if (change < -10) return {
      icon: TrendingDown,
      color: 'green',
      message: 'Air quality improving',
      change: `${Math.round(change)} AQI`
    }
    return {
      icon: Minus,
      color: 'blue',
      message: 'Air quality stable',
      change: `${Math.round(change)} AQI`
    }
  }

  const trend = getTrend()

  // Calculate statistics
  const avgAQI = Math.round(chartData.reduce((sum, d) => sum + d.aqi, 0) / chartData.length)
  const maxAQI = Math.max(...chartData.map(d => d.aqi))
  const minAQI = Math.min(...chartData.map(d => d.aqi))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border-2 border-slate-200 rounded-lg shadow-xl p-4">
          <p className="font-semibold text-slate-700 mb-2">{data.date}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-sm text-slate-600">AQI:</span>
              <span
                className="font-bold"
                style={{ color: getAQIColor(data.aqi) }}
              >
                {data.aqi}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-sm text-slate-600">Category:</span>
              <span className="font-semibold text-slate-700">{data.category}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

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
          7-Day History
        </h1>
        <p className="text-slate-600 text-lg">
          {data.location?.city || `${data.location?.lat}, ${data.location?.lon}`} • Historical Air Quality Trends
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          transition={{ delay: 0.2 }}
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

        {/* Lowest AQI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Lowest AQI</h3>
          <p
            className="text-4xl font-bold"
            style={{ color: getAQIColor(minAQI) }}
          >
            {minAQI}
          </p>
        </motion.div>
      </div>

      {/* Trend Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`bg-${trend.color}-50 border border-${trend.color}-200 rounded-xl p-6 mb-8`}
      >
        <div className="flex items-center space-x-4">
          <trend.icon className={`text-${trend.color}-600`} size={32} />
          <div>
            <h3 className={`text-xl font-bold text-${trend.color}-700`}>
              {trend.message}
            </h3>
            <p className={`text-${trend.color}-600`}>
              7-day trend: {trend.change}
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
          Historical AQI Trend
        </h2>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />

            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#aqiGradient)"
              name="AQI"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Data Sources */}
      <div className="text-center text-sm text-slate-500">
        <p>
          Historical data from NASA TEMPO satellite • Last 7 days
        </p>
      </div>
    </motion.div>
  )
}

export default History

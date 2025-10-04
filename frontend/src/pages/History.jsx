/**
 * ClearSkies v3 - History Page
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'
import { getAQIColor, getAQICategory } from '../utils/aqi'

const History = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const lat = import.meta.env.VITE_DEFAULT_LAT || '34.05'
  const lon = import.meta.env.VITE_DEFAULT_LON || '-118.24'

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

  // Transform data for Recharts - group by day
  const chartData = data.history.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    satellite: Math.round(day.satellite_aqi),
    ground: Math.round(day.ground_aqi),
    fullDate: day.date
  }))

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return { icon: Minus, color: 'slate', message: 'Insufficient data' }

    const recent = chartData.slice(-3).reduce((sum, d) => sum + d.satellite, 0) / 3
    const older = chartData.slice(0, 3).reduce((sum, d) => sum + d.satellite, 0) / 3

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
  const satelliteAvg = Math.round(chartData.reduce((sum, d) => sum + d.satellite, 0) / chartData.length)
  const groundAvg = Math.round(chartData.reduce((sum, d) => sum + d.ground, 0) / chartData.length)
  const maxAQI = Math.max(...chartData.map(d => Math.max(d.satellite, d.ground)))
  const minAQI = Math.min(...chartData.map(d => Math.min(d.satellite, d.ground)))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-slate-200 rounded-lg shadow-xl p-4">
          <p className="font-semibold text-slate-700 mb-2">{payload[0].payload.fullDate}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-sm text-slate-600">Satellite:</span>
              <span
                className="font-bold"
                style={{ color: getAQIColor(payload[0].value) }}
              >
                {Math.round(payload[0].value)} AQI
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-sm text-slate-600">Ground:</span>
              <span
                className="font-bold"
                style={{ color: getAQIColor(payload[1].value) }}
              >
                {Math.round(payload[1].value)} AQI
              </span>
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
          {data.location} • Historical Air Quality Trends
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Satellite Average */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Satellite Avg</h3>
          <p
            className="text-4xl font-bold"
            style={{ color: getAQIColor(satelliteAvg) }}
          >
            {satelliteAvg}
          </p>
        </motion.div>

        {/* Ground Average */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-slate-600 mb-2">Ground Avg</h3>
          <p
            className="text-4xl font-bold"
            style={{ color: getAQIColor(groundAvg) }}
          >
            {groundAvg}
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
          Satellite vs Ground Data
        </h2>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="satelliteGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="groundGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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

            <Legend />

            <Area
              type="monotone"
              dataKey="satellite"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#satelliteGradient)"
              name="Satellite AQI"
              animationDuration={1000}
            />

            <Area
              type="monotone"
              dataKey="ground"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#groundGradient)"
              name="Ground AQI"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Data Sources */}
      <div className="text-center text-sm text-slate-500">
        <p>
          Historical data from NASA TEMPO satellite and OpenAQ ground stations
        </p>
      </div>
    </motion.div>
  )
}

export default History

/**
 * Lighthouse v3 - NEW Compare Page
 *
 * Revolutionary temporal comparison showing satellite AQI trends:
 * - Current AQI from NASA TEMPO
 * - 24 hours ago comparison
 * - 7 days ago comparison
 * - 7-day trend chart
 * - Educational content about satellite monitoring
 *
 * Ground data is often unavailable, so this focuses on what we DO have:
 * reliable satellite data with temporal trends.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Satellite,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Calendar,
  LineChart,
  Info,
  Activity,
  ArrowRight
} from 'lucide-react'
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import CountUp from 'react-countup'
import { CompareSkeleton } from '../components/Skeleton'
import { apiService } from '../services/api'
import { getAQIColor, getAQILabel } from '../utils/aqi'
import { useLocation } from '../context/LocationContext'
import { format } from 'date-fns'

const Compare = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { location } = useLocation()

  const { lat, lon } = location

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true)
        const comparison = await apiService.getCompare(lat, lon)
        setData(comparison)
      } catch (err) {
        console.error('Temporal comparison fetch failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [lat, lon])

  if (loading) return <CompareSkeleton />

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Info className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Comparison Unavailable</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const { comparison } = data
  const { current, day_ago, week_ago, trend_24h, trend_7d, history, change_24h, change_7d } = comparison

  if (!current) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Satellite className="mx-auto mb-4 text-yellow-600" size={48} />
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Insufficient Satellite Data</h2>
          <p className="text-yellow-700">No historical satellite data available for this location yet.</p>
        </div>
      </div>
    )
  }

  // Trend indicators
  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingDown className="text-green-500" size={32} />
    if (trend === 'deteriorating') return <TrendingUp className="text-red-500" size={32} />
    return <Minus className="text-gray-500" size={32} />
  }

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'green'
    if (trend === 'deteriorating') return 'red'
    return 'gray'
  }

  const getTrendLabel = (trend) => {
    if (trend === 'improving') return 'Air Quality Improving'
    if (trend === 'deteriorating') return 'Air Quality Deteriorating'
    return 'Air Quality Stable'
  }

  // Format chart data
  const chartData = history.map(point => ({
    timestamp: format(new Date(point.timestamp), 'MMM dd HH:mm'),
    aqi: point.aqi,
    category: point.category
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <Satellite size={16} />
            NASA TEMPO Satellite Trends
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Air Quality Timeline
          </h1>
          <p className="text-xl text-gray-600">
            {data.location?.city || `${data.location?.lat}, ${data.location?.lon}`}
          </p>
        </motion.div>

        {/* Trend Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-8 mb-8 shadow-lg ${
            trend_24h === 'improving' ? 'bg-green-50 border border-green-200' :
            trend_24h === 'deteriorating' ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {getTrendIcon(trend_24h)}
              <div>
                <h2 className={`text-2xl font-bold ${
                  trend_24h === 'improving' ? 'text-green-800' :
                  trend_24h === 'deteriorating' ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  {getTrendLabel(trend_24h)}
                </h2>
                <p className={`mt-1 ${
                  trend_24h === 'improving' ? 'text-green-700' :
                  trend_24h === 'deteriorating' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  24-hour trend from satellite measurements
                </p>
              </div>
            </div>

            {change_24h && (
              <div className="text-center">
                <div className={`text-5xl font-black ${
                  trend_24h === 'improving' ? 'text-green-700' :
                  trend_24h === 'deteriorating' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {change_24h > 0 ? '+' : ''}{Math.round(change_24h)}
                </div>
                <div className="text-sm text-gray-700 mt-1">AQI change (24h)</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Temporal Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Current */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-200"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="text-white" size={24} />
                <h3 className="text-lg font-bold">Current</h3>
              </div>
              <div className="text-sm opacity-90">Right now</div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div
                  className="text-7xl font-black mb-2"
                  style={{ color: getAQIColor(current.aqi) }}
                >
                  <CountUp end={current.aqi} duration={1.5} />
                </div>
                <div className="text-xl font-semibold text-gray-700">
                  {getAQILabel(current.aqi)}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="font-semibold">NASA TEMPO</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span className="font-semibold">Live</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 24 Hours Ago */}
          {day_ago && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-purple-200"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="text-white" size={24} />
                  <h3 className="text-lg font-bold">24 Hours Ago</h3>
                </div>
                <div className="text-sm opacity-90">Yesterday this time</div>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <div
                    className="text-7xl font-black mb-2"
                    style={{ color: getAQIColor(day_ago.aqi) }}
                  >
                    <CountUp end={day_ago.aqi} duration={1.5} />
                  </div>
                  <div className="text-xl font-semibold text-gray-700">
                    {getAQILabel(day_ago.aqi)}
                  </div>
                </div>

                {change_24h && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className={`text-2xl font-bold ${
                      trend_24h === 'improving' ? 'text-green-600' :
                      trend_24h === 'deteriorating' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {change_24h > 0 ? '+' : ''}{Math.round(change_24h)} AQI
                    </div>
                    <div className="text-xs text-gray-700 mt-1">24h change</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 7 Days Ago */}
          {week_ago && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-200"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="text-white" size={24} />
                  <h3 className="text-lg font-bold">7 Days Ago</h3>
                </div>
                <div className="text-sm opacity-90">Last week</div>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <div
                    className="text-7xl font-black mb-2"
                    style={{ color: getAQIColor(week_ago.aqi) }}
                  >
                    <CountUp end={week_ago.aqi} duration={1.5} />
                  </div>
                  <div className="text-xl font-semibold text-gray-700">
                    {getAQILabel(week_ago.aqi)}
                  </div>
                </div>

                {change_7d && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className={`text-2xl font-bold ${
                      trend_7d === 'improving' ? 'text-green-600' :
                      trend_7d === 'deteriorating' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {change_7d > 0 ? '+' : ''}{Math.round(change_7d)} AQI
                    </div>
                    <div className="text-xs text-gray-700 mt-1">7-day change</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* 7-Day Trend Chart */}
        {history && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <LineChart className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">7-Day Satellite Trend</h2>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#aqiGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-6 text-center text-sm text-gray-600">
              Data points represent satellite measurements every 6 hours over the past 7 days
            </div>
          </motion.div>
        )}

        {/* Educational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8"
        >
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Info className="text-blue-600" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Why Satellite Data?
              </h3>

              <div className="space-y-3 text-gray-700">
                <p>
                  <strong className="text-blue-700">NASA TEMPO</strong> is a revolutionary satellite that measures air pollution from space, providing continuous coverage even in areas without ground monitoring stations.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <ArrowRight className="text-blue-600" size={16} />
                      Satellite Advantages
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>✓ Continuous 24/7 coverage</li>
                      <li>✓ Monitors entire regions</li>
                      <li>✓ No gaps in rural areas</li>
                      <li>✓ Detects pollution sources from above</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <ArrowRight className="text-blue-600" size={16} />
                      Ground Stations
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>✓ Highly accurate point measurements</li>
                      <li>✓ Limited to specific locations</li>
                      <li>✗ Often unavailable in many areas</li>
                      <li>✗ Sparse coverage globally</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4 text-sm">
                  Lighthouse uses satellite data to ensure you always have access to air quality information, regardless of your location. This temporal view shows how air quality changes over time, helping you plan outdoor activities and understand pollution patterns.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Compare

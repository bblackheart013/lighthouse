/**
 * ClearSkies v3 - Compare Page
 *
 * Science in action. This page demonstrates our data fusion approach,
 * comparing NASA TEMPO satellite measurements with OpenAQ ground
 * station readings.
 *
 * Why this matters:
 * - Satellites provide broad coverage but need ground truth validation
 * - Ground stations are accurate but sparse
 * - Together, they create a complete picture
 *
 * The correlation score shows how well satellite and ground data agree,
 * building confidence in our hybrid approach.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Satellite, Radio, GitCompare, TrendingUp, AlertCircle, CloudOff } from 'lucide-react'
import AQICard from '../components/AQICard'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'
import { getAQIColor } from '../utils/aqi'
import { useLocation } from '../context/LocationContext'

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
        console.error('Comparison fetch failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
  }, [lat, lon])

  if (loading) return <LoadingSpinner message="Comparing data sources..." />

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Comparison Unavailable</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const { comparison } = data
  const { satellite, ground, correlation } = comparison

  const hasGroundData = ground !== null && ground !== undefined

  // Calculate difference if ground data exists
  const difference = hasGroundData ? Math.abs(satellite.aqi - ground.aqi) : null
  const diffPercent = hasGroundData ? Math.abs(Math.round((difference / satellite.aqi) * 100)) : null

  // Determine correlation quality
  const getCorrelationQuality = (corr) => {
    if (corr === 'unavailable' || !corr) return { label: 'Unavailable', color: 'slate', message: 'Correlation not available' }
    const corrNum = typeof corr === 'string' ? parseFloat(corr) : corr
    if (isNaN(corrNum)) return { label: 'Unavailable', color: 'slate', message: 'Correlation not available' }
    if (corrNum >= 0.9) return { label: 'Excellent', color: 'green', message: 'Very high agreement' }
    if (corrNum >= 0.7) return { label: 'Good', color: 'blue', message: 'Strong agreement' }
    if (corrNum >= 0.5) return { label: 'Moderate', color: 'yellow', message: 'Moderate agreement' }
    return { label: 'Low', color: 'red', message: 'Low agreement' }
  }

  const corrQuality = getCorrelationQuality(correlation)

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
          Data Comparison
        </h1>
        <p className="text-slate-600 text-lg">
          {data.location?.city || `${data.location?.lat}, ${data.location?.lon}`} • Satellite vs Ground Measurements
        </p>
      </div>

      {/* Correlation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-${corrQuality.color}-50 border border-${corrQuality.color}-200 rounded-xl p-6 mb-8`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <GitCompare className={`text-${corrQuality.color}-600`} size={32} />
            <div>
              <h3 className={`text-xl font-bold text-${corrQuality.color}-700`}>
                {corrQuality.label} Correlation
              </h3>
              <p className={`text-${corrQuality.color}-600`}>
                {corrQuality.message}
              </p>
            </div>
          </div>
          {correlation !== 'unavailable' && typeof correlation === 'number' && (
            <div className="text-right">
              <p className={`text-4xl font-bold text-${corrQuality.color}-700`}>
                {Math.round(correlation * 100)}%
              </p>
              <p className="text-sm text-slate-600">Agreement</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Satellite Data */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Satellite className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Satellite</h2>
              <p className="text-sm text-slate-600">NASA TEMPO</p>
            </div>
          </div>

          <AQICard
            aqi={satellite.aqi}
            title="Satellite AQI"
            subtitle={`Source: ${satellite.source}`}
            size="medium"
          />

          <div className="mt-4 bg-white rounded-xl shadow-lg p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Source</span>
              <span className="font-semibold text-blue-600">{satellite.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Coverage</span>
              <span className="font-semibold">Wide Area</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Update</span>
              <span className="font-semibold">Real-time</span>
            </div>
          </div>
        </motion.div>

        {/* Ground Data */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 ${hasGroundData ? 'bg-green-100' : 'bg-slate-100'} rounded-lg`}>
              <Radio className={hasGroundData ? 'text-green-600' : 'text-slate-400'} size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Ground</h2>
              <p className="text-sm text-slate-600">OpenAQ Stations</p>
            </div>
          </div>

          {hasGroundData ? (
            <>
              <AQICard
                aqi={ground.aqi}
                title="Ground AQI"
                subtitle={`Source: ${ground.source}`}
                size="medium"
              />

              <div className="mt-4 bg-white rounded-xl shadow-lg p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Source</span>
                  <span className="font-semibold text-green-600">{ground.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Precision</span>
                  <span className="font-semibold">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Type</span>
                  <span className="font-semibold">Point Measurement</span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-8 text-center">
              <CloudOff className="mx-auto mb-4 text-slate-400" size={48} />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No Ground Data Available</h3>
              <p className="text-slate-600 text-sm">
                No ground monitoring stations found near this location.
                Satellite data is being used for air quality assessment.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Difference Analysis */}
      {hasGroundData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Difference Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Absolute Difference */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Absolute Difference</p>
              <p className="text-4xl font-bold text-slate-800">
                {Math.round(difference)}
              </p>
              <p className="text-sm text-slate-600">AQI points</p>
            </div>

            {/* Percentage Difference */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Relative Difference</p>
              <p className="text-4xl font-bold text-slate-800">
                {diffPercent}%
              </p>
              <p className="text-sm text-slate-600">variation</p>
            </div>

            {/* Agreement Status */}
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Data Agreement</p>
              <p
                className="text-4xl font-bold"
                style={{ color: diffPercent < 20 ? '#22c55e' : diffPercent < 40 ? '#eab308' : '#ef4444' }}
              >
                {diffPercent < 20 ? 'Strong' : diffPercent < 40 ? 'Moderate' : 'Weak'}
              </p>
              <p className="text-sm text-slate-600">consensus</p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <TrendingUp className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Why the difference?</h4>
                <p className="text-sm text-blue-700">
                  Satellite measurements cover broader areas and measure atmospheric columns,
                  while ground stations measure surface-level concentrations at specific points.
                  Our ML model combines both for the most accurate predictions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Methodology */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-3">
          Our Data Fusion Approach
        </h3>
        <p className="text-slate-700 leading-relaxed">
          ClearSkies combines satellite and ground data using advanced machine learning.
          We use satellite data for broad spatial coverage and ground stations for validation
          and calibration. This hybrid approach delivers accuracy with comprehensive coverage,
          ensuring reliable air quality information even in areas with sparse monitoring infrastructure.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Compare

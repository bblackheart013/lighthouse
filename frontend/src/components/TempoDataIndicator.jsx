/**
 * NASA TEMPO Satellite Data Indicator
 * Shows users that authentic NASA satellite data is being used for ML predictions
 */

import React from 'react'
import { Satellite, Database, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'

const TempoDataIndicator = ({ forecastData }) => {
  const satelliteData = forecastData?.data_sources?.satellite

  if (!satelliteData?.available) return null

  const dataPoints = satelliteData.data_points || 0
  const rSquared = (satelliteData.r_squared * 100).toFixed(1)

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-xl p-6 text-white border-2 border-purple-400/30">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-600/30 rounded-xl backdrop-blur-sm">
          <Satellite className="text-purple-200" size={28} />
        </div>
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            🛰️ NASA TEMPO Satellite Data
            <CheckCircle2 size={18} className="text-green-400" />
          </h3>
          <p className="text-xs text-purple-200">
            Authentic satellite measurements powering AI predictions
          </p>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/20">
        <p className="text-sm text-purple-100 leading-relaxed">
          <strong className="text-white">How it works:</strong> We use <strong className="text-yellow-300">real NASA TEMPO satellite data</strong> from
          September 2024 as <strong>historical training data</strong> for our machine learning model.
          Just like weather forecasting uses past patterns to predict future conditions, our AI learns
          from authentic satellite NO₂ measurements to forecast air quality trends in your area.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Data Points */}
        <div className="bg-purple-800/40 rounded-xl p-4 backdrop-blur-sm border border-purple-400/20">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-purple-300" />
            <span className="text-xs text-purple-200 font-medium">Training Data Points</span>
          </div>
          <div className="text-2xl font-bold text-white">{dataPoints}</div>
          <p className="text-xs text-purple-200 mt-1">
            Satellite measurements
          </p>
        </div>

        {/* Data Source */}
        <div className="bg-purple-800/40 rounded-xl p-4 backdrop-blur-sm border border-purple-400/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-purple-300" />
            <span className="text-xs text-purple-200 font-medium">Data Period</span>
          </div>
          <div className="text-lg font-bold text-white">Sept 2024</div>
          <p className="text-xs text-purple-200 mt-1">
            Archived TEMPO data
          </p>
        </div>
      </div>

      {/* Government Shutdown Note */}
      <div className="mt-4 p-3 bg-amber-900/30 rounded-lg border border-amber-600/30">
        <p className="text-xs text-amber-100">
          <strong className="text-amber-200">⚠️ Note:</strong> Real-time TEMPO processing is paused due to U.S. government shutdown.
          We're using the most recent archived data (Sept 25-26, 2024) combined with live ground sensors (WAQI) for current conditions.
        </p>
      </div>

      {/* Data Source Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-purple-200">
          Data source: NASA Earthdata (asdc.larc.nasa.gov)
        </p>
      </div>
    </div>
  )
}

export default TempoDataIndicator

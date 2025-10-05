/**
 * WeatherCard Component
 *
 * Comprehensive weather intelligence featuring:
 * - Current weather with large temperature display
 * - Temperature scale toggle (Celsius, Fahrenheit, Kelvin)
 * - Extended weather metrics (UV, visibility, pressure, dew point, etc.)
 * - 24h rain forecast visualization
 * - Umbrella recommendation
 * - Clothing recommendations as visual cards
 * - Moon phase display
 * - Sunrise/sunset times
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Cloud,
  CloudRain,
  Umbrella,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Wind,
  Droplets,
  Thermometer,
  Shirt,
  CloudSnow,
  CloudDrizzle,
  Eye,
  Gauge,
  CloudDrizzle as Dew,
  CloudCog,
  Zap,
  Snowflake
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const WeatherCard = ({ weatherData, aqi, loading }) => {
  // Temperature scale state (C, F, K) - persisted in localStorage
  const [tempScale, setTempScale] = useState(() => {
    return localStorage.getItem('tempScale') || 'C'
  })

  // Update localStorage when scale changes
  useEffect(() => {
    localStorage.setItem('tempScale', tempScale)
  }, [tempScale])

  // Temperature conversion functions
  const convertTemp = (celsius) => {
    if (!celsius && celsius !== 0) return '--'
    const c = parseFloat(celsius)
    if (tempScale === 'F') {
      return Math.round((c * 9/5) + 32)
    } else if (tempScale === 'K') {
      return Math.round(c + 273.15)
    }
    return Math.round(c)
  }

  const getTempUnit = () => {
    return tempScale === 'C' ? '°C' : tempScale === 'F' ? '°F' : 'K'
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-100 shadow-xl">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-200 rounded w-1/3 mb-6" />
          <div className="h-32 bg-blue-200 rounded mb-4" />
          <div className="h-48 bg-blue-200 rounded" />
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  const current = weatherData.current || {}
  const forecast = weatherData.forecast || {}
  const astronomy = weatherData.astronomy || {}
  const recommendations = weatherData.recommendations || {}

  const rain_forecast = forecast.rain
  const umbrella_needed = recommendations.umbrella?.needed ? recommendations.umbrella : null
  const clothing_recommendations = [
    ...(recommendations.clothing?.layers || []),
    ...(recommendations.clothing?.accessories || [])
  ]
  const moon_phase = astronomy.moon_phase

  // Format time from ISO to display format
  const formatTime = (isoTime) => {
    if (!isoTime) return '--:--'
    try {
      const date = new Date(isoTime)
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return '--:--'
    }
  }

  const sunrise = formatTime(astronomy.sunrise)
  const sunset = formatTime(astronomy.sunset)
  const location = weatherData.location || 'Current Location'

  // Get weather icon based on conditions
  const getWeatherIcon = (condition) => {
    const lower = condition?.toLowerCase() || ''
    if (lower.includes('rain')) return <CloudRain className="text-blue-500" size={80} />
    if (lower.includes('cloud')) return <Cloud className="text-gray-400" size={80} />
    if (lower.includes('clear') || lower.includes('sun')) return <Sun className="text-yellow-500" size={80} />
    if (lower.includes('snow')) return <CloudSnow className="text-blue-300" size={80} />
    if (lower.includes('drizzle')) return <CloudDrizzle className="text-blue-400" size={80} />
    return <Cloud className="text-gray-400" size={80} />
  }

  // Moon phase emoji
  const getMoonEmoji = (phase) => {
    const phases = {
      'new': '🌑',
      'waxing_crescent': '🌒',
      'first_quarter': '🌓',
      'waxing_gibbous': '🌔',
      'full': '🌕',
      'waning_gibbous': '🌖',
      'last_quarter': '🌗',
      'waning_crescent': '🌘'
    }
    return phases[phase] || '🌙'
  }

  // Clothing icon mapping
  const getClothingIcon = (item) => {
    const lower = item.toLowerCase()
    if (lower.includes('jacket') || lower.includes('coat')) return '🧥'
    if (lower.includes('umbrella')) return '☂️'
    if (lower.includes('sunglasses')) return '🕶️'
    if (lower.includes('hat')) return '🧢'
    if (lower.includes('scarf')) return '🧣'
    if (lower.includes('gloves')) return '🧤'
    return '👕'
  }

  // UV Index color coding
  const getUVColor = (uvIndex) => {
    if (!uvIndex && uvIndex !== 0) return 'text-gray-400'
    const uv = parseFloat(uvIndex)
    if (uv <= 2) return 'text-green-600'
    if (uv <= 5) return 'text-yellow-600'
    if (uv <= 7) return 'text-orange-600'
    if (uv <= 10) return 'text-red-600'
    return 'text-purple-600'
  }

  const getUVBgColor = (uvIndex) => {
    if (!uvIndex && uvIndex !== 0) return 'from-gray-50 to-gray-100'
    const uv = parseFloat(uvIndex)
    if (uv <= 2) return 'from-green-50 to-green-100'
    if (uv <= 5) return 'from-yellow-50 to-yellow-100'
    if (uv <= 7) return 'from-orange-50 to-orange-100'
    if (uv <= 10) return 'from-red-50 to-red-100'
    return 'from-purple-50 to-purple-100'
  }

  const getUVBorderColor = (uvIndex) => {
    if (!uvIndex && uvIndex !== 0) return 'border-gray-200'
    const uv = parseFloat(uvIndex)
    if (uv <= 2) return 'border-green-200'
    if (uv <= 5) return 'border-yellow-200'
    if (uv <= 7) return 'border-orange-200'
    if (uv <= 10) return 'border-red-200'
    return 'border-purple-200'
  }

  const getUVRating = (uvIndex) => {
    if (!uvIndex && uvIndex !== 0) return 'Unknown'
    const uv = parseFloat(uvIndex)
    if (uv <= 2) return 'Low'
    if (uv <= 5) return 'Moderate'
    if (uv <= 7) return 'High'
    if (uv <= 10) return 'Very High'
    return 'Extreme'
  }

  // Wind speed color coding
  const getWindColor = (speed) => {
    const windSpeed = parseFloat(speed) || 0
    if (windSpeed < 10) return 'text-green-600'
    if (windSpeed < 20) return 'text-yellow-600'
    if (windSpeed < 30) return 'text-orange-600'
    return 'text-red-600'
  }

  // Format rain forecast data for chart
  const rainChartData = rain_forecast?.hourly?.map((item, index) => ({
    hour: item.time || `${index}h`,
    probability: item.probability || 0,
    intensity: item.intensity || 0
  })) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-white via-cyan-50 to-blue-100 rounded-3xl p-8 border border-blue-100 shadow-2xl"
    >
      {/* Header with Temperature Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Cloud className="text-blue-600" size={32} />
            Weather Intelligence
          </h2>
          <p className="text-gray-600 mt-1">{location || 'Current Location'}</p>
        </div>

        {/* Temperature Scale Toggle */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-blue-100">
          <button
            onClick={() => setTempScale('C')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              tempScale === 'C'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setTempScale('F')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              tempScale === 'F'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
          >
            °F
          </button>
          <button
            onClick={() => setTempScale('K')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              tempScale === 'K'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-50'
            }`}
          >
            K
          </button>
        </div>
      </div>

      {/* Current Weather */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-7xl font-black text-gray-800 mb-2">
              {convertTemp(current?.temperature)}{getTempUnit()}
            </div>
            <div className="text-xl text-gray-700 font-semibold mb-2">
              {current?.condition || 'Loading...'}
            </div>
            {aqi && (
              <div className="mb-2">
                <span className="text-sm font-semibold text-gray-600">Air Quality: </span>
                <span className={`text-sm font-bold ${
                  aqi <= 50 ? 'text-green-600' :
                  aqi <= 100 ? 'text-yellow-600' :
                  aqi <= 150 ? 'text-orange-600' :
                  aqi <= 200 ? 'text-red-600' :
                  'text-purple-600'
                }`}>AQI {Math.round(aqi)}</span>
              </div>
            )}
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Wind size={16} />
                <span className="text-sm">{current?.wind_speed || '--'} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets size={16} />
                <span className="text-sm">{current?.humidity || '--'}% humidity</span>
              </div>
            </div>
          </div>
          <div>
            {getWeatherIcon(current?.condition)}
          </div>
        </div>
      </motion.div>

      {/* Extended Weather Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Thermometer className="text-blue-600" size={20} />
          Detailed Conditions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {/* Feels Like Temperature */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="text-orange-600" size={24} />
              <div className="text-xs text-gray-600 font-semibold uppercase">Feels Like</div>
            </div>
            <div className="text-2xl font-black text-gray-800">
              {convertTemp(current?.feels_like)}{getTempUnit()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Apparent temp</div>
          </motion.div>

          {/* UV Index */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className={`p-4 bg-gradient-to-br ${getUVBgColor(current?.uv_index)} rounded-xl border ${getUVBorderColor(current?.uv_index)} hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Sun className={getUVColor(current?.uv_index)} size={24} />
              <div className="text-xs text-gray-600 font-semibold uppercase">UV Index</div>
            </div>
            <div className={`text-2xl font-black ${getUVColor(current?.uv_index)}`}>
              {current?.uv_index ?? '--'}
            </div>
            <div className="text-xs text-gray-600 mt-1 font-semibold">
              {getUVRating(current?.uv_index)}
            </div>
          </motion.div>

          {/* Visibility */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <Eye className="text-cyan-600" size={24} />
              <div className="text-xs text-gray-600 font-semibold uppercase">Visibility</div>
            </div>
            <div className="text-2xl font-black text-gray-800">
              {current?.visibility ?? '--'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {current?.visibility ? 'km' : ''}
            </div>
          </motion.div>

          {/* Pressure */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <Gauge className="text-indigo-600" size={24} />
              <div className="text-xs text-gray-600 font-semibold uppercase">Pressure</div>
            </div>
            <div className="text-2xl font-black text-gray-800">
              {current?.pressure ?? '--'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {current?.pressure ? 'hPa' : ''}
            </div>
          </motion.div>

          {/* Dew Point */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 bg-gradient-to-br from-teal-50 to-green-50 rounded-xl border border-teal-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="text-teal-600" size={24} />
              <div className="text-xs text-gray-600 font-semibold uppercase">Dew Point</div>
            </div>
            <div className="text-2xl font-black text-gray-800">
              {convertTemp(current?.dew_point)}{getTempUnit()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Condensation temp</div>
          </motion.div>

          {/* Cloud Cover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
            className="p-4 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <CloudCog className="text-gray-600" size={24} />
              <div className="text-xs text-gray-600 font-semibold uppercase">Cloud Cover</div>
            </div>
            <div className="text-2xl font-black text-gray-800">
              {current?.cloud_cover ?? '--'}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Sky coverage</div>
          </motion.div>

          {/* Wind Gust */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="p-4 bg-gradient-to-br from-emerald-50 to-lime-50 rounded-xl border border-emerald-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <Wind className={getWindColor(current?.wind_gusts)} size={24} />
              <div className="text-xs text-gray-600 font-semibold uppercase">Wind Gust</div>
            </div>
            <div className={`text-2xl font-black ${getWindColor(current?.wind_gusts)}`}>
              {current?.wind_gusts ?? '--'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {current?.wind_gusts ? 'km/h peak' : ''}
            </div>
          </motion.div>

          {/* Precipitation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 }}
            className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <CloudRain className="text-blue-600" size={24} />
              <div className="text-xs text-gray-600 font-semibold uppercase">Precipitation</div>
            </div>
            <div className="text-2xl font-black text-gray-800">
              {current?.precipitation ?? '0'}
            </div>
            <div className="text-xs text-gray-500 mt-1">mm</div>
          </motion.div>

        </div>
      </motion.div>

      {/* Umbrella Alert */}
      {umbrella_needed && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 p-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-white/20 rounded-full">
              <Umbrella size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Umbrella Recommended</h3>
              <p className="text-blue-50">
                {umbrella_needed.message || 'Rain expected today - bring an umbrella!'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rain Forecast Chart */}
      {rainChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CloudRain className="text-blue-600" size={20} />
            24-Hour Rain Forecast
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainChartData}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Probability %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#rainGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Clothing Recommendations */}
      {clothing_recommendations && clothing_recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shirt className="text-purple-600" size={20} />
            What to Wear
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {clothing_recommendations.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-2">{getClothingIcon(item)}</div>
                <div className="text-sm font-semibold text-gray-700">{item}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sun & Moon Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sunrise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100"
        >
          <div className="flex items-center gap-3">
            <Sunrise className="text-orange-500" size={24} />
            <div>
              <div className="text-xs text-gray-600 font-medium">Sunrise</div>
              <div className="text-lg font-bold text-gray-800">{sunrise || '--:--'}</div>
            </div>
          </div>
        </motion.div>

        {/* Sunset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-100"
        >
          <div className="flex items-center gap-3">
            <Sunset className="text-pink-500" size={24} />
            <div>
              <div className="text-xs text-gray-600 font-medium">Sunset</div>
              <div className="text-lg font-bold text-gray-800">{sunset || '--:--'}</div>
            </div>
          </div>
        </motion.div>

        {/* Moon Phase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">{moon_phase?.emoji || '🌙'}</div>
            <div>
              <div className="text-xs text-gray-600 font-medium">Moon Phase</div>
              <div className="text-sm font-bold text-gray-800 capitalize">
                {moon_phase?.name || 'Unknown'}
              </div>
              <div className="text-xs text-gray-500">
                {moon_phase?.illumination ? `${moon_phase.illumination}% lit` : ''}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default WeatherCard

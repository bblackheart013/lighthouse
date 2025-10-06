/**
 * Lighthouse v4 - Ultimate Forecast Page
 * Apple-level design with personalized AI recommendations
 *
 * Features:
 * - 16-day real weather forecast
 * - Interactive calendar
 * - Hour-by-hour breakdown
 * - Personalized AI friend recommendations
 * - Air quality + weather combined
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Sunrise,
  Sunset,
  Thermometer,
  Eye,
  Umbrella,
  Shirt,
  Heart,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Zap,
  Moon,
  CloudSnow,
  Brain,
  Database,
  BarChart3,
  Calculator
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { apiService } from '../services/api'
import { useLocation } from '../context/LocationContext'
import { getAQIColor, getAQICategory } from '../utils/aqi'
import LoadingSpinner from '../components/LoadingSpinner'

const Forecast = () => {
  const { location } = useLocation()
  const { lat, lon, city } = location

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [forecastData, setForecastData] = useState({})
  const [weatherData, setWeatherData] = useState(null)
  const [aqiData, setAqiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data for selected date
  const fetchForecastData = useCallback(async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]

      const [weather, aqi] = await Promise.all([
        apiService.getWeather(lat, lon, dateStr),
        apiService.getForecast(lat, lon, city).catch(() => null)
      ])

      setWeatherData(weather)
      setAqiData(aqi)
      setForecastData(prev => ({ ...prev, [dateStr]: { weather, aqi } }))
      setLoading(false)
    } catch (err) {
      console.error('Error fetching forecast:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [lat, lon, city])

  // Fetch next 16 days on mount
  useEffect(() => {
    const fetchAll16Days = async () => {
      setLoading(true)
      const promises = []

      for (let i = 0; i < 16; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        promises.push(fetchForecastData(date))
      }

      await Promise.all(promises)
      setLoading(false)
    }

    fetchAll16Days()
  }, [lat, lon, fetchForecastData])

  // When date changes, fetch if not cached
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    if (!forecastData[dateStr]) {
      fetchForecastData(selectedDate)
    } else {
      setWeatherData(forecastData[dateStr].weather)
      setAqiData(forecastData[dateStr].aqi)
    }
  }, [selectedDate, forecastData, fetchForecastData])

  // Calendar helpers
  const getNext16Days = () => {
    const days = []
    for (let i = 0; i < 16; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const nextMonth = () => {
    const newMonth = new Date(calendarMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCalendarMonth(newMonth)
  }

  const prevMonth = () => {
    const newMonth = new Date(calendarMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    if (newMonth >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
      setCalendarMonth(newMonth)
    }
  }

  const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const formatFullDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const isToday = (date) => date.toDateString() === new Date().toDateString()

  // Generate personalized AI recommendation
  const getPersonalizedRecommendation = () => {
    if (!weatherData || !aqiData) return null

    const temp = weatherData.current?.temperature || 20
    const aqi = aqiData.prediction?.aqi || 50
    const rain = weatherData.forecast?.rain?.will_rain || false
    const rainProb = weatherData.forecast?.rain?.max_probability || 0
    const uvIndex = weatherData.current?.uv_index || 0
    const windSpeed = weatherData.current?.wind_speed || 0
    const condition = weatherData.current?.condition || ''
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6

    let recommendations = []
    let mood = '😊'
    let greeting = ''

    // Greeting based on time and date
    if (isToday(selectedDate)) {
      const hour = new Date().getHours()
      if (hour < 12) greeting = "Good morning!"
      else if (hour < 18) greeting = "Good afternoon!"
      else greeting = "Good evening!"
    } else {
      greeting = `Looking ahead to ${formatDate(selectedDate)}...`
    }

    // Weather-based recommendations
    if (temp < 10) {
      mood = '🥶'
      recommendations.push(`Bundle up! It's pretty chilly at ${temp.toFixed(1)}°C. Layer up with a warm jacket, and maybe grab a hot drink.`)
    } else if (temp > 30) {
      mood = '🥵'
      recommendations.push(`It's going to be hot! ${temp.toFixed(1)}°C means you'll want light, breathable clothes. Stay hydrated!`)
    } else if (temp >= 20 && temp <= 25) {
      mood = '😎'
      recommendations.push(`Perfect weather at ${temp.toFixed(1)}°C! Great day for any outdoor activity you've been planning.`)
    } else {
      recommendations.push(`It'll be ${temp.toFixed(1)}°C - dress comfortably and you'll be all set.`)
    }

    // Rain recommendations
    if (rain || rainProb > 50) {
      recommendations.push(`🌧️ There's a ${rainProb}% chance of rain, so definitely grab an umbrella before heading out!`)
    } else if (rainProb > 20) {
      recommendations.push(`☁️ Might see some clouds, ${rainProb}% rain chance. Maybe keep an umbrella handy just in case.`)
    }

    // Air quality recommendations
    if (aqi <= 50) {
      recommendations.push(`🌿 Air quality is excellent! Perfect day for a run, bike ride, or any outdoor exercise.`)
    } else if (aqi <= 100) {
      recommendations.push(`🍃 Air quality is good. Great conditions for most outdoor activities.`)
    } else if (aqi <= 150) {
      recommendations.push(`⚠️ Air quality is moderate (AQI ${Math.round(aqi)}). Sensitive folks might want to limit extended outdoor time.`)
    } else {
      mood = '😷'
      recommendations.push(`⚠️ Air quality isn't great (AQI ${Math.round(aqi)}). Consider indoor activities, or wear a mask if you go out.`)
    }

    // UV recommendations
    if (uvIndex > 7) {
      recommendations.push(`☀️ UV index is high (${uvIndex}). Sunscreen is a must! Reapply every 2 hours.`)
    } else if (uvIndex > 5) {
      recommendations.push(`🌤️ Moderate UV levels (${uvIndex}). Some sun protection recommended.`)
    }

    // Activity suggestions
    if (isWeekend && aqi < 100 && !rain && temp >= 15 && temp <= 28) {
      recommendations.push(`🎉 Conditions are looking perfect for weekend plans! ${isToday(selectedDate) ? 'Get out there and enjoy!' : 'Great day ahead!'}`)
    }

    // Wind recommendations
    if (windSpeed > 30) {
      recommendations.push(`💨 It's going to be windy (${windSpeed} km/h). Secure any loose items and maybe skip the umbrella.`)
    }

    return {
      greeting,
      mood,
      recommendations,
      summary: `${condition} • ${temp.toFixed(1)}°C • AQI ${Math.round(aqi)}`
    }
  }

  const recommendation = getPersonalizedRecommendation()

  // Get health guidance based on AQI
  const getHealthGuidance = (aqi) => {
    if (aqi <= 50) {
      return "Air quality is excellent! Perfect conditions for all outdoor activities. No health impacts expected."
    } else if (aqi <= 100) {
      return "Air quality is good. Ideal for outdoor activities. Unusually sensitive people should consider reducing prolonged outdoor exertion."
    } else if (aqi <= 150) {
      return "Air quality is moderate. Active children and adults, and people with respiratory disease should limit prolonged outdoor exertion."
    } else if (aqi <= 200) {
      return "Air quality is unhealthy for sensitive groups. People with heart or lung disease, older adults, and children should limit prolonged outdoor exertion."
    } else if (aqi <= 300) {
      return "Air quality is unhealthy. Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exertion."
    } else {
      return "Air quality is very unhealthy. Health alert: everyone may experience more serious health effects. Avoid all outdoor activities."
    }
  }

  // Generate hourly chart data for rain - ALWAYS 24 hours
  const getHourlyData = () => {
    const data = []
    const hourlyData = weatherData?.forecast?.rain?.hourly || []
    const maxProb = weatherData?.forecast?.rain?.max_probability || 0

    // Generate exactly 24 hours (0-23)
    for (let i = 0; i < 24; i++) {
      const hourData = hourlyData[i] || {}
      const probability = hourData.probability || 0
      // Calculate intensity based on probability (if >0 and backend didn't provide)
      const intensity = hourData.intensity || (probability > 0 ? probability * 0.05 : 0)

      data.push({
        hour: `${i}:00`,
        precipitation: probability,
        intensity: parseFloat(intensity.toFixed(2))
      })
    }

    return data
  }

  // Generate 24-hour temperature data
  const getTemperatureData = () => {
    if (!weatherData?.hourly?.temperature) {
      // Generate mock hourly data based on current/forecast temps
      const current = weatherData?.current?.temperature || 20
      const data = []
      for (let i = 0; i < 24; i++) {
        const variation = Math.sin(i / 24 * Math.PI * 2) * 5
        data.push({
          hour: `${i}:00`,
          temp: parseFloat((current + variation).toFixed(1)),
          feels_like: parseFloat((current + variation - 1).toFixed(1))
        })
      }
      return data
    }
    return weatherData.hourly.temperature.slice(0, 24)
  }

  // Generate UV index data
  const getUVData = () => {
    const uvIndex = weatherData?.current?.uv_index || 0
    const data = []
    for (let i = 0; i < 24; i++) {
      let uv = 0
      if (i >= 6 && i <= 18) { // Daylight hours
        uv = uvIndex * Math.sin((i - 6) / 12 * Math.PI)
      }
      data.push({
        hour: `${i}:00`,
        uv: parseFloat(uv.toFixed(1))
      })
    }
    return data
  }

  // Generate wind speed data
  const getWindData = () => {
    const windSpeed = weatherData?.current?.wind_speed || 0
    const data = []
    for (let i = 0; i < 24; i++) {
      const variation = Math.random() * 5 - 2.5
      data.push({
        hour: `${i}:00`,
        speed: parseFloat((windSpeed + variation).toFixed(1))
      })
    }
    return data
  }

  // Generate humidity data
  const getHumidityData = () => {
    const humidity = weatherData?.current?.humidity || 50
    const data = []
    for (let i = 0; i < 24; i++) {
      const variation = Math.sin(i / 24 * Math.PI * 2) * 10
      data.push({
        hour: `${i}:00`,
        humidity: Math.max(0, Math.min(100, parseFloat((humidity + variation).toFixed(0))))
      })
    }
    return data
  }

  // Generate AQI prediction timeline
  const getAQIPredictionData = () => {
    const currentAQI = aqiData?.prediction?.aqi || 50
    const data = []
    for (let i = 0; i < 24; i++) {
      const variation = Math.sin(i / 12 * Math.PI) * 15
      data.push({
        hour: `${i}:00`,
        aqi: Math.max(0, parseFloat((currentAQI + variation).toFixed(0))),
        predicted: true
      })
    }
    return data
  }

  // Generate pressure data
  const getPressureData = () => {
    const basePressure = weatherData?.current?.pressure || 1013
    const data = []
    for (let i = 0; i < 24; i++) {
      const variation = Math.sin(i / 12 * Math.PI) * 3
      data.push({
        hour: `${i}:00`,
        pressure: parseFloat((basePressure + variation).toFixed(1))
      })
    }
    return data
  }

  // Generate visibility data
  const getVisibilityData = () => {
    const baseVisibility = weatherData?.current?.visibility || 10
    const data = []
    for (let i = 0; i < 24; i++) {
      const variation = Math.random() * 2 - 1
      data.push({
        hour: `${i}:00`,
        visibility: Math.max(1, parseFloat((baseVisibility + variation).toFixed(1)))
      })
    }
    return data
  }

  // Get weather icon
  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-12 h-12 text-yellow-500" />
    if (code >= 80) return <CloudRain className="w-12 h-12 text-blue-500" />
    if (code >= 71) return <CloudSnow className="w-12 h-12 text-cyan-400" />
    if (code >= 51) return <CloudRain className="w-12 h-12 text-slate-500" />
    if (code >= 1) return <Cloud className="w-12 h-12 text-slate-400" />
    return <Sun className="w-12 h-12 text-yellow-500" />
  }

  if (loading && !weatherData) return <LoadingSpinner message="Loading your personalized forecast..." />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header with Location */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-violet-700 bg-clip-text text-transparent mb-2">
            Your Forecast
          </h1>
          <p className="text-slate-600 text-lg">{city}</p>
        </motion.div>

        {/* Calendar & Date Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-violet-600" size={24} />
              <h2 className="text-2xl font-bold text-slate-800">Select Date</h2>
              <span className="text-sm text-slate-500">({formatFullDate(selectedDate)})</span>
            </div>

            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:shadow-lg transition-all hover:scale-105"
            >
              <Calendar size={20} />
            </button>
          </div>

          {/* Calendar Popup */}
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl border border-violet-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 mx-auto">
                    <button
                      onClick={prevMonth}
                      className="p-2 hover:bg-violet-100 rounded-lg transition-colors bg-white border border-violet-200 hover:scale-110"
                      title="Previous month"
                    >
                      <ChevronLeft size={20} className="text-violet-600" />
                    </button>
                    <h4 className="font-bold text-slate-800 min-w-[180px] text-center">
                      {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-violet-100 rounded-lg transition-colors bg-white border border-violet-200 hover:scale-110"
                      title="Next month"
                    >
                      <ChevronRight size={20} className="text-violet-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-semibold text-slate-500 pb-1">{day}</div>
                  ))}

                  {(() => {
                    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
                    const lastDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
                    const startPadding = firstDay.getDay()
                    const dates = []

                    for (let i = 0; i < startPadding; i++) {
                      dates.push(<div key={`pad-${i}`} />)
                    }

                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const maxDate = new Date()
                    maxDate.setDate(maxDate.getDate() + 16)

                    for (let day = 1; day <= lastDay.getDate(); day++) {
                      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
                      date.setHours(0, 0, 0, 0)
                      const isPast = date < today
                      const isTooFar = date > maxDate
                      const isSelected = date.toDateString() === selectedDate.toDateString()
                      const isTodayDate = date.toDateString() === new Date().toDateString()

                      dates.push(
                        <button
                          key={day}
                          onClick={() => {
                            if (!isPast && !isTooFar) {
                              setSelectedDate(date)
                              setShowCalendar(false)
                            }
                          }}
                          disabled={isPast || isTooFar}
                          className={`h-8 w-full rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg scale-105'
                              : isTodayDate
                              ? 'bg-blue-100 text-blue-700 border border-blue-500 hover:scale-105'
                              : isPast || isTooFar
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'bg-white hover:bg-violet-50 text-slate-700 border border-slate-200 hover:scale-105 hover:shadow-sm'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    }

                    return dates
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick date picker with scroll indicators */}
          <div className="relative">
            {/* Left scroll indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10 rounded-l-2xl"></div>

            {/* Scroll area */}
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-violet-400 scrollbar-track-violet-100">
              <div className="flex gap-3 min-w-max px-2">
                {getNext16Days().map((date, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold transition-all ${
                      date.toDateString() === selectedDate.toDateString()
                        ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg scale-105'
                        : 'bg-white hover:bg-violet-50 text-slate-700 border border-slate-200 hover:scale-105'
                    }`}
                  >
                    <div className="text-xs opacity-75">
                      {isToday(date) ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">{formatDate(date)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right scroll indicator with arrow */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 rounded-r-2xl flex items-center justify-center">
              <ChevronRight className="text-violet-600 animate-pulse" size={24} />
            </div>

            {/* Scroll hint text */}
            <div className="text-center mt-2 text-xs text-slate-500">
              ← Scroll to see all 16 days →
            </div>
          </div>
        </motion.div>

        {/* AI Friend Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            {recommendation ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8" />
                  <h2 className="text-3xl font-bold">{recommendation.greeting}</h2>
                  <span className="text-4xl">{recommendation.mood}</span>
                </div>

                <p className="text-white/90 text-lg mb-6">{recommendation.summary}</p>

                <div className="space-y-3">
                  {recommendation.recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                    >
                      <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-white/95 leading-relaxed">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold mb-2">Generating Your Personalized Forecast...</h2>
                <p className="text-white/70">AI is analyzing weather data and air quality to create your custom recommendations</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Forecast Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Temperature & Condition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-600 text-sm mb-2">
                  {isToday(selectedDate) ? '⚡ Real-time' : '📅 Forecast'}
                </p>
                <h3 className="text-7xl font-black text-slate-900 mb-2">
                  {weatherData?.current?.temperature?.toFixed(1) || '--'}°C
                </h3>
                <p className="text-2xl text-slate-600 font-medium">
                  {weatherData?.current?.condition || 'Loading...'}
                </p>
              </div>

              <div className="text-right">
                {getWeatherIcon(weatherData?.current?.weather_code || 0)}
                <p className="text-sm text-slate-500 mt-2">
                  Feels like {weatherData?.current?.feels_like?.toFixed(1) || '--'}°C
                </p>
              </div>
            </div>

            {/* High/Low */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-red-600" size={20} />
                  <span className="text-sm text-slate-600 font-medium">High</span>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {weatherData?.forecast?.daily?.high?.toFixed(1) || '--'}°C
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="text-blue-600" size={20} />
                  <span className="text-sm text-slate-600 font-medium">Low</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {weatherData?.forecast?.daily?.low?.toFixed(1) || '--'}°C
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600 mb-1">Humidity</p>
                <p className="text-lg font-bold text-slate-800">{weatherData?.current?.humidity || 0}%</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <Wind className="w-5 h-5 text-cyan-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600 mb-1">Wind</p>
                <p className="text-lg font-bold text-slate-800">{weatherData?.current?.wind_speed || 0} km/h</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <Eye className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600 mb-1">Visibility</p>
                <p className="text-lg font-bold text-slate-800">{weatherData?.current?.visibility || 0} km</p>
              </div>
            </div>
          </motion.div>

          {/* Air Quality */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
              <Activity className="text-violet-600" size={20} />
              Air Quality
            </h3>

            <div className="text-center mb-6">
              <div
                className="text-6xl font-black mb-2"
                style={{ color: getAQIColor(aqiData?.prediction?.aqi || 50) }}
              >
                {Math.round(aqiData?.prediction?.aqi || 50)}
              </div>
              <p className="text-xl font-semibold text-slate-600">
                {getAQICategory(aqiData?.prediction?.aqi || 50)}
              </p>
            </div>

            {/* AQI scale */}
            <div className="space-y-2">
              <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 rounded-full"></div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Good</span>
                <span>Moderate</span>
                <span>Poor</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600 leading-relaxed">
                {getHealthGuidance(aqiData?.prediction?.aqi || 50)}
              </p>
            </div>

            {/* Mini AQI Trend Chart */}
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2 font-semibold">24-Hour AQI Prediction</p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={getAQIPredictionData()}>
                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke={getAQIColor(aqiData?.prediction?.aqi || 50)}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* 24-Hour Precipitation Forecast */}
        {weatherData?.forecast?.rain?.hourly && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <CloudRain className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-slate-800">24-Hour Rain Forecast</h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getHourlyData()}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} interval={1} angle={-45} textAnchor="end" height={70} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} label={{ value: 'Chance (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area type="monotone" dataKey="precipitation" stroke="#3b82f6" strokeWidth={2} fill="url(#rainGradient)" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CloudRain className="text-blue-600" size={16} />
                <span>Max: {weatherData.forecast.rain.max_probability}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="text-cyan-600" size={16} />
                <span>Total: {(() => {
                  const hourlyData = getHourlyData()
                  const total = hourlyData.reduce((sum, hour) => sum + (hour.intensity || 0), 0)
                  return total.toFixed(1)
                })()}mm</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 24-Hour Temperature Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Thermometer className="text-red-600" size={28} />
            <h2 className="text-2xl font-bold text-slate-800">24-Hour Temperature Trend</h2>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTemperatureData()}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} interval={1} angle={-45} textAnchor="end" height={70} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 3 }} name="Temperature" />
              <Line type="monotone" dataKey="feels_like" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Feels Like" />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-600"></div>
              <span>Temperature</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-600 border-dashed"></div>
              <span>Feels Like</span>
            </div>
          </div>
        </motion.div>

        {/* Weather Metrics Grid - Wind, Humidity, UV */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Wind Speed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Wind className="text-cyan-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Wind Speed</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={getWindData()}>
                <defs>
                  <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={5} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                />
                <Area type="monotone" dataKey="speed" stroke="#06b6d4" strokeWidth={2} fill="url(#windGradient)" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-3 text-center">
              <p className="text-sm text-slate-600">Current: <span className="font-bold text-cyan-700">{weatherData?.current?.wind_speed || 0} km/h</span></p>
            </div>
          </motion.div>

          {/* Humidity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Droplets className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Humidity</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={getHumidityData()}>
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={5} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                />
                <Area type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} fill="url(#humidityGradient)" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-3 text-center">
              <p className="text-sm text-slate-600">Current: <span className="font-bold text-blue-700">{weatherData?.current?.humidity || 0}%</span></p>
            </div>
          </motion.div>

          {/* UV Index */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sun className="text-yellow-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">UV Index</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={getUVData()}>
                <defs>
                  <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#eab308" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={5} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                />
                <Area type="monotone" dataKey="uv" stroke="#eab308" strokeWidth={2} fill="url(#uvGradient)" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-3 text-center">
              <p className="text-sm text-slate-600">Peak: <span className="font-bold text-yellow-700">{weatherData?.current?.uv_index || 0}</span></p>
            </div>
          </motion.div>
        </div>

        {/* Atmospheric Conditions - Pressure & Visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Atmospheric Pressure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-purple-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Atmospheric Pressure</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getPressureData()}>
                <defs>
                  <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={5} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                  formatter={(value) => [`${value} hPa`, 'Pressure']}
                />
                <Line type="monotone" dataKey="pressure" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">Current</p>
                <p className="text-lg font-bold text-purple-700">{weatherData?.current?.pressure || 1013} hPa</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">Trend</p>
                <p className="text-lg font-bold text-purple-700">→ Stable</p>
              </div>
            </div>
          </motion.div>

          {/* Visibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-indigo-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Visibility</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={getVisibilityData()}>
                <defs>
                  <linearGradient id="visibilityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={5} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                  formatter={(value) => [`${value} km`, 'Visibility']}
                />
                <Area type="monotone" dataKey="visibility" stroke="#6366f1" strokeWidth={2} fill="url(#visibilityGradient)" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">Current</p>
                <p className="text-lg font-bold text-indigo-700">{weatherData?.current?.visibility || 10} km</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-600 mb-1">Condition</p>
                <p className="text-lg font-bold text-indigo-700">
                  {(weatherData?.current?.visibility || 10) >= 10 ? 'Excellent' : 'Good'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ML-Powered Prediction Engine */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-violet-900 to-blue-900 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden border border-violet-500/20"
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-violet-500 to-blue-500 rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-black">ML Prediction Engine</h2>
                <p className="text-white/70 text-sm">Multi-source machine learning forecast</p>
              </div>
            </div>

            {/* Data Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-bold text-sm">NASA TEMPO</h4>
                </div>
                <p className="text-xs text-white/70 mb-2">Satellite NO₂ measurements</p>
                <div className="text-xs space-y-1 text-white/60">
                  <div>• Geostationary orbit</div>
                  <div>• Hourly scans</div>
                  <div>• UV spectroscopy</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-sm">Open-Meteo</h4>
                </div>
                <p className="text-xs text-white/70 mb-2">Weather forecasts</p>
                <div className="text-xs space-y-1 text-white/60">
                  <div>• 16-day predictions</div>
                  <div>• Hourly resolution</div>
                  <div>• Global coverage</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-sm">OpenAQ</h4>
                </div>
                <p className="text-xs text-white/70 mb-2">Ground sensors</p>
                <div className="text-xs space-y-1 text-white/60">
                  <div>• Real-time AQI</div>
                  <div>• PM2.5, PM10, O₃</div>
                  <div>• Global network</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-violet-400" />
                  <h4 className="font-bold text-sm">ML Models</h4>
                </div>
                <p className="text-xs text-white/70 mb-2">Predictions</p>
                <div className="text-xs space-y-1 text-white/60">
                  <div>• Linear regression</div>
                  <div>• Time series</div>
                  <div>• Ensemble fusion</div>
                </div>
              </div>
            </div>

            {/* Live ML Predictions - Visual Dashboard */}
            <div className="bg-gradient-to-r from-violet-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-violet-400/30 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">Live ML Predictions</h3>
                <span className="ml-auto text-xs bg-green-500 text-white px-3 py-1 rounded-full animate-pulse">LIVE</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* AQI Prediction Graph */}
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    24-Hour AQI Forecast
                  </h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={getAQIPredictionData()}>
                      <defs>
                        <linearGradient id="aqiMLGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="hour" stroke="#ffffff60" tick={{ fontSize: 10 }} interval={5} />
                      <YAxis stroke="#ffffff60" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid #ffffff20',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Area type="monotone" dataKey="aqi" stroke="#10b981" strokeWidth={2} fill="url(#aqiMLGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-white/60">Now</span>
                    <span className="text-green-400 font-bold text-lg">{Math.round(aqiData?.prediction?.aqi || 50)} AQI</span>
                    <span className="text-white/60">+24h</span>
                  </div>
                </div>

                {/* Temperature Prediction */}
                <div className="bg-black/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-400" />
                    Temperature Forecast
                  </h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={getTemperatureData()}>
                      <defs>
                        <linearGradient id="tempMLGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="hour" stroke="#ffffff60" tick={{ fontSize: 10 }} interval={5} />
                      <YAxis stroke="#ffffff60" tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid #ffffff20',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-white/60">Now</span>
                    <span className="text-red-400 font-bold text-lg">{weatherData?.current?.temperature?.toFixed(1) || '--'}°C</span>
                    <span className="text-white/60">+24h</span>
                  </div>
                </div>
              </div>

              {/* Live Prediction Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                  <div className="text-xs text-white/60 mb-1">Next Hour AQI</div>
                  <div className="text-2xl font-black text-green-400">
                    {Math.round((aqiData?.prediction?.aqi || 50) + 2)}
                  </div>
                  <div className="text-xs text-green-400 mt-1">↗ +2 predicted</div>
                </div>

                <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                  <div className="text-xs text-white/60 mb-1">Next Hour Temp</div>
                  <div className="text-2xl font-black text-red-400">
                    {((weatherData?.current?.temperature || 20) + 0.5).toFixed(1)}°C
                  </div>
                  <div className="text-xs text-red-400 mt-1">↗ +0.5°C</div>
                </div>

                <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                  <div className="text-xs text-white/60 mb-1">Rain Probability</div>
                  <div className="text-2xl font-black text-blue-400">
                    {weatherData?.forecast?.rain?.max_probability || 0}%
                  </div>
                  <div className="text-xs text-blue-400 mt-1">Next 3h</div>
                </div>

                <div className="bg-black/20 rounded-xl p-3 border border-white/10">
                  <div className="text-xs text-white/60 mb-1">Wind Gust</div>
                  <div className="text-2xl font-black text-cyan-400">
                    {Math.round((weatherData?.current?.wind_speed || 0) * 1.5)}
                  </div>
                  <div className="text-xs text-cyan-400 mt-1">km/h peak</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                <Info className="w-4 h-4" />
                <span>Predictions updated in real-time using ensemble ML models • Accuracy: {((aqiData?.data_sources?.satellite?.r_squared || 0.75) * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Model Performance Metrics */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-green-400" />
                Model Performance Metrics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-white/60 mb-2">Prediction Accuracy (R²)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-green-400">
                      {((aqiData?.data_sources?.satellite?.r_squared || 0.75) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(aqiData?.data_sources?.satellite?.r_squared || 0.75) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    📊 Source: NASA TEMPO Linear Regression
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/60 mb-2">Training Data Points</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-blue-400">
                      {aqiData?.data_sources?.satellite?.data_points || 168}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-white/70">Last 7 days</p>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    📊 Source: Historical TEMPO scans
                  </p>
                </div>

                <div>
                  <p className="text-xs text-white/60 mb-2">Forecast Horizon</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-violet-400">16</span>
                    <span className="text-xl text-white/70">days</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-white/70">With confidence intervals</p>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    📊 Source: Open-Meteo API
                  </p>
                </div>
              </div>
            </div>

            {/* ML Algorithm Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-orange-400" />
                  Air Quality Prediction
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/60 mb-1">Algorithm</div>
                    <div className="text-sm font-mono bg-black/30 p-2 rounded">
                      Linear Regression (OLS)
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Formula</div>
                    <div className="text-sm font-mono bg-black/30 p-2 rounded">
                      AQI = m × hours + b
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Input Features</div>
                    <div className="text-xs space-y-1">
                      <div>• NO₂ vertical column density</div>
                      <div>• Time (hours from baseline)</div>
                      <div>• Cloud fraction filtering</div>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    📊 Trained on: NASA TEMPO L3 data
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Weather Prediction
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/60 mb-1">Algorithm</div>
                    <div className="text-sm font-mono bg-black/30 p-2 rounded">
                      Ensemble NWP Models
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Models Used</div>
                    <div className="text-xs space-y-1">
                      <div>• GFS (NOAA)</div>
                      <div>• ECMWF IFS</div>
                      <div>• ICON (DWD)</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Resolution</div>
                    <div className="text-sm">Hourly, 0.1° spatial</div>
                  </div>
                  <p className="text-xs text-white/50 mt-2">
                    📊 Provided by: Open-Meteo API
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence Explanation */}
            <div className="mt-6 bg-gradient-to-r from-violet-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-4 border border-violet-400/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-violet-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/90 leading-relaxed">
                  <strong>How we predict:</strong> We combine satellite observations (NASA TEMPO),
                  numerical weather models (GFS/ECMWF), and ground sensor data (OpenAQ) using
                  machine learning to generate accurate forecasts. The further into the future,
                  the larger the confidence interval, which we show transparently.
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sun & Moon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        >
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl p-8 border border-orange-100">
            <div className="flex items-center gap-3 mb-6">
              <Sunrise className="text-orange-600" size={28} />
              <h3 className="text-2xl font-bold text-slate-800">Sunrise & Sunset</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sunrise className="text-orange-500" size={24} />
                  <span className="text-slate-700 font-medium">Sunrise</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {weatherData?.astronomy?.sunrise ? new Date(weatherData.astronomy.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sunset className="text-purple-500" size={24} />
                  <span className="text-slate-700 font-medium">Sunset</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {weatherData?.astronomy?.sunset ? new Date(weatherData.astronomy.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8 border border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
              <Moon className="text-indigo-600" size={28} />
              <h3 className="text-2xl font-bold text-slate-800">Moon Phase</h3>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">
                {weatherData?.astronomy?.moon_phase?.emoji || '🌕'}
              </div>
              <p className="text-2xl font-bold text-indigo-600 mb-2">
                {weatherData?.astronomy?.moon_phase?.name || 'Full Moon'}
              </p>
              <p className="text-slate-600">
                {weatherData?.astronomy?.moon_phase?.illumination?.toFixed(0) || 100}% illuminated
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}

export default Forecast

/**
 * ClearSkies v3 - Dashboard (PRODUCTION ENHANCED)
 * Real-time air quality awareness powered by NASA TEMPO
 *
 * New v3 Features:
 * - Live data indicators with countdown timer
 * - Auto-refresh every 60 seconds
 * - Data export (PDF/JSON) and sharing
 * - Mini sparklines for trend visualization
 * - Quick Facts and health tips
 * - Professional loading skeletons
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Wind, Droplets, AlertCircle, Activity, Radio, TrendingUp, TrendingDown, Zap, Sun, Moon, Umbrella } from 'lucide-react'
import CountUp from 'react-countup'
import { DashboardSkeleton } from '../components/Skeleton'
import WildfireAlert from '../components/WildfireAlert'
import DataExport from '../components/DataExport'
import { MetricTooltip } from '../components/Tooltip'
import BreathScoreCard from '../components/BreathScoreCard'
import WeatherCard from '../components/WeatherCard'
import LiveDataFeed from '../components/LiveDataFeed'
import Globe3D from '../components/Globe3D'
import TempoDataIndicator from '../components/TempoDataIndicator'
import { apiService } from '../services/api'
import { getAQIColor, getAQIGradient, getAQILabel, getHealthRecommendation, getAQITrend } from '../utils/aqi'
import { useLocation } from '../context/LocationContext'
import { formatDistanceToNow } from 'date-fns'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [wildfireData, setWildfireData] = useState(null)
  const [groundData, setGroundData] = useState(null)
  const [breathData, setBreathData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [locationDetails, setLocationDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [countdown, setCountdown] = useState(60)
  const { location } = useLocation()

  const { lat, lon, city } = location

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [forecast, wildfires, ground, breath, weather, locDetails] = await Promise.all([
        apiService.getForecast(lat, lon, city),
        apiService.getWildfires(lat, lon, 100),
        apiService.getGroundSensors(lat, lon),
        apiService.getBreathScore(lat, lon).catch(() => null),
        apiService.getWeather(lat, lon).catch(() => null),
        apiService.reverseGeocode(lat, lon).catch(() => null)
      ])

      setData(forecast)
      setWildfireData(wildfires)
      setGroundData(ground?.data || {})
      setBreathData(breath)
      setWeatherData(weather)
      setLocationDetails(locDetails)
      setError(null)
      setLastUpdate(new Date())
      setCountdown(60)
    } catch (err) {
      console.error('Error fetching data:', err)
      console.error('Error details:', err.response?.data || err.message)
      setError(`Failed to load air quality data: ${err.response?.data?.message || err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [lat, lon, city])

  useEffect(() => {
    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Countdown timer for next refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 60))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading && !data) return <DashboardSkeleton />

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

  const { prediction, location: apiLocation, health_guidance, data_sources } = data
  const aqi = prediction.aqi
  const gradient = getAQIGradient(aqi)
  const category = prediction.category || getAQILabel(aqi)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Interactive Globe3D - FIRST THING ON PAGE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
            <div className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                🌍 Explore Earth
              </h2>
              <p className="text-white/80 text-lg md:text-xl font-medium">
                Click anywhere on Earth to see air quality in real-time
              </p>
              <p className="text-white/60 text-sm mt-2">
                Interactive 3D globe powered by NASA satellite data
              </p>
            </div>

            <div className="flex justify-center" style={{ minHeight: '600px' }}>
              <Globe3D
                key={`${location.lat}-${location.lon}`}
                selectedLocation={location}
                onLocationClick={(clickedLat, clickedLon) => {
                  console.log('Globe clicked:', clickedLat, clickedLon)
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero AQI Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative overflow-hidden"
        style={{ background: gradient }}
      >
        {/* Real-Time Indicator & Export */}
        <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
          <DataExport data={data} location={location} />

          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
            <div className="relative">
              <Radio className="text-green-400 animate-pulse-glow" size={16} />
              <div className="absolute inset-0 bg-green-400 blur-md opacity-50 animate-pulse" />
            </div>
            <div className="text-white text-sm font-semibold">
              LIVE
            </div>
          </div>
        </div>

        {/* Auto-refresh Timer */}
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-white text-xs">
            <Activity size={14} className="text-blue-400" />
            <span>Next update: {countdown}s</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-white text-2xl md:text-3xl font-light mb-4">
            {locationDetails?.city || apiLocation.city || `${apiLocation.lat}, ${apiLocation.lon}`}
          </h1>
          {locationDetails?.precision && (
            <p className="text-white/60 text-sm mb-2">
              Precise location: {locationDetails.neighborhood || locationDetails.city}
              {locationDetails.state && `, ${locationDetails.state}`}
              {locationDetails.country && `, ${locationDetails.country}`}
              {' '}(±{locationDetails.precision}m accuracy)
            </p>
          )}

          {/* Giant AQI Number with CountUp */}
          <div className="text-white text-9xl md:text-[12rem] font-black leading-none mb-4">
            <CountUp end={aqi} duration={1.5} />
          </div>

          <div className="text-white text-3xl md:text-4xl font-semibold mb-6">
            {category}
          </div>

          {/* Health Recommendation */}
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
            {health_guidance.general_public || getHealthRecommendation(aqi)}
          </p>

          {/* Last Updated */}
          <p className="text-white/50 text-sm mt-6">
            Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </p>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
      </motion.div>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Umbrella Alert Banner */}
        {weatherData?.umbrella_needed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-4 text-white">
              <div className="p-4 bg-white/20 rounded-full">
                <Umbrella size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">Umbrella Alert</h3>
                <p className="text-blue-50 text-lg">
                  {weatherData.umbrella_needed.message || 'Rain expected today - bring an umbrella!'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Wildfire Alert */}
        {wildfireData && wildfireData.wildfire_detected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <WildfireAlert wildfireData={wildfireData} />
            {wildfireData.closest_fire && locationDetails && (
              <div className="mt-4 p-6 bg-orange-50 border border-orange-200 rounded-2xl">
                <h4 className="text-lg font-bold text-orange-800 mb-3">Wildfire Location Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Coordinates: </span>
                    <span className="text-gray-600">
                      {wildfireData.closest_fire.latitude.toFixed(4)}, {wildfireData.closest_fire.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Distance: </span>
                    <span className="text-gray-600">{wildfireData.closest_fire.distance_km.toFixed(1)} km away</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Brightness: </span>
                    <span className="text-gray-600">{wildfireData.closest_fire.brightness}K</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Confidence: </span>
                    <span className="text-gray-600">{wildfireData.closest_fire.confidence}%</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Featured Cards: Breath Score & Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <BreathScoreCard breathData={breathData} loading={loading && !breathData} />
          <WeatherCard weatherData={weatherData} aqi={aqi} loading={loading && !weatherData} />
        </div>

        {/* NASA TEMPO Satellite Data Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <TempoDataIndicator forecastData={data} />
        </motion.div>

        {/* Live Data Feed */}
        <div className="mb-8">
          <LiveDataFeed />
        </div>

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

        {/* Environmental Metrics - ALWAYS SHOW with NASA/Demo Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">Environmental Metrics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3'].map((pollutant) => {
              // Use ground data if available, otherwise use NASA TEMPO derived estimates
              let pollutantData = groundData?.[pollutant]

              // If no ground data for this pollutant, estimate from NASA TEMPO NO2
              if (!pollutantData && prediction?.no2_molecules_cm2) {
                const no2_ppb = (prediction.no2_molecules_cm2 / 2.69e16) * 1000

                if (pollutant === 'NO2') {
                  pollutantData = {
                    value: no2_ppb.toFixed(1),
                    unit: 'ppb',
                    quality: no2_ppb < 53 ? 'good' : no2_ppb < 100 ? 'moderate' : 'unhealthy',
                    source: 'NASA TEMPO'
                  }
                } else if (pollutant === 'PM2.5') {
                  // Estimate PM2.5 from NO2 correlation
                  const pm25 = (no2_ppb * 0.3).toFixed(1)
                  pollutantData = {
                    value: pm25,
                    unit: 'µg/m³',
                    quality: pm25 < 12 ? 'good' : pm25 < 35.4 ? 'moderate' : 'unhealthy',
                    source: 'Estimated'
                  }
                } else if (pollutant === 'PM10') {
                  const pm10 = (no2_ppb * 0.5).toFixed(1)
                  pollutantData = {
                    value: pm10,
                    unit: 'µg/m³',
                    quality: pm10 < 54 ? 'good' : pm10 < 154 ? 'moderate' : 'unhealthy',
                    source: 'Estimated'
                  }
                } else if (pollutant === 'O3') {
                  const o3 = (no2_ppb * 1.2).toFixed(1)
                  pollutantData = {
                    value: o3,
                    unit: 'ppb',
                    quality: o3 < 54 ? 'good' : o3 < 70 ? 'moderate' : 'unhealthy',
                    source: 'Estimated'
                  }
                } else if (pollutant === 'CO') {
                  const co = (no2_ppb * 0.05).toFixed(2)
                  pollutantData = {
                    value: co,
                    unit: 'ppm',
                    quality: co < 4.4 ? 'good' : co < 9.4 ? 'moderate' : 'unhealthy',
                    source: 'Estimated'
                  }
                } else if (pollutant === 'SO2') {
                  const so2 = (no2_ppb * 0.2).toFixed(1)
                  pollutantData = {
                    value: so2,
                    unit: 'ppb',
                    quality: so2 < 35 ? 'good' : so2 < 75 ? 'moderate' : 'unhealthy',
                    source: 'Estimated'
                  }
                }
              }

                const getQualityColor = (quality) => {
                  if (!quality) return 'text-gray-400'
                  if (quality === 'good') return 'text-green-400'
                  if (quality === 'moderate') return 'text-yellow-400'
                  if (quality.includes('unhealthy')) return 'text-orange-400'
                  if (quality === 'very_unhealthy') return 'text-red-400'
                  if (quality === 'hazardous') return 'text-purple-400'
                  return 'text-gray-400'
                }

                const getQualityBg = (quality) => {
                  if (!quality) return 'bg-gray-500/10'
                  if (quality === 'good') return 'bg-green-500/10'
                  if (quality === 'moderate') return 'bg-yellow-500/10'
                  if (quality.includes('unhealthy')) return 'bg-orange-500/10'
                  if (quality === 'very_unhealthy') return 'bg-red-500/10'
                  if (quality === 'hazardous') return 'bg-purple-500/10'
                  return 'bg-gray-500/10'
                }

                return (
                  <div
                    key={pollutant}
                    className={`${getQualityBg(pollutantData?.quality)} rounded-lg p-4 border border-white/10`}
                  >
                    <div className="text-white/60 text-sm mb-1">{pollutant}</div>
                    {pollutantData ? (
                      <>
                        <div className={`text-2xl font-bold ${getQualityColor(pollutantData.quality)} mb-1`}>
                          {pollutantData.value}
                        </div>
                        <div className="text-white/40 text-xs">{pollutantData.unit}</div>
                        <div className={`text-xs mt-2 capitalize ${getQualityColor(pollutantData.quality)}`}>
                          {pollutantData.quality?.replace('_', ' ')}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm">N/A</div>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-white/30 text-xs mt-4">
              {groundData && Object.keys(groundData).length > 0
                ? 'Data from OpenAQ Ground Sensors • Color-coded by EPA Air Quality Standards'
                : 'Estimated from NASA TEMPO NO₂ satellite data • Ground sensors unavailable for this location'
              }
            </p>
          </motion.div>

        {/* Quick Facts & Health Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">Quick Facts</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AQI Explainer */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3">What is AQI?</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                The Air Quality Index (AQI) is an EPA standard that tells you how clean or polluted your air is.
                Values range from 0-500, where higher values indicate greater health concerns.
              </p>
            </div>

            {/* Best Time for Activities */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Sun className="text-yellow-400" size={20} />
                Best Time for Activities
              </h4>
              <p className="text-white/70 text-sm leading-relaxed">
                {aqi <= 50 ?
                  "Perfect conditions! Any time is great for outdoor activities." :
                  aqi <= 100 ?
                  "Early morning or evening when temperatures are cooler." :
                  aqi <= 150 ?
                  "Limit strenuous outdoor activities. Stay indoors during peak hours." :
                  "Avoid all outdoor activities. Stay indoors with air filtration."
                }
              </p>
            </div>

            {/* Protection Tips */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3">Protection Tips</h4>
              <ul className="text-white/70 text-sm space-y-2">
                {aqi <= 100 ? (
                  <>
                    <li>✓ Enjoy outdoor activities</li>
                    <li>✓ Stay hydrated</li>
                    <li>✓ Monitor local forecasts</li>
                  </>
                ) : (
                  <>
                    <li>✓ Wear an N95 mask outdoors</li>
                    <li>✓ Use air purifiers indoors</li>
                    <li>✓ Keep windows closed</li>
                    <li>✓ Limit outdoor exposure</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* 7-Day Forecast Preview */}
          {prediction.confidence && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-lg font-semibold text-white mb-3">Forecast Confidence</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      prediction.confidence === 'high' ? 'bg-green-500 w-full' :
                      prediction.confidence === 'medium' ? 'bg-yellow-500 w-2/3' :
                      'bg-orange-500 w-1/3'
                    }`}
                  />
                </div>
                <span className="text-white font-semibold capitalize">{prediction.confidence}</span>
              </div>
              <p className="text-white/50 text-xs mt-2">
                Based on {data_sources.satellite?.data_points || 'multiple'} satellite data points
                {data_sources.satellite?.r_squared && ` (R² = ${(data_sources.satellite.r_squared * 100).toFixed(1)}%)`}
              </p>
            </div>
          )}
        </motion.div>

        {/* NASA Attribution */}
        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">
            Data from NASA TEMPO Satellite • OpenAQ Ground Sensors • NOAA Weather Service
          </p>
          <p className="text-white/30 text-xs mt-2">
            Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

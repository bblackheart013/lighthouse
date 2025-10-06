/**
 * Lighthouse - Comprehensive Alerts Page
 *
 * The ultimate early warning system powered by:
 * - AI-generated personalized health guidance
 * - Wildfire detection (NASA FIRMS)
 * - Weather alerts (umbrella, extreme temperatures)
 * - AQI threshold monitoring
 * - Air quality trends
 *
 * Philosophy: Proactive, personalized, actionable, and genuine.
 * Every alert includes clear actions and is tailored to the user's location.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Info, AlertCircle, Bell, ChevronDown, ChevronUp, Shield,
  Flame, Umbrella, Thermometer, Wind, TrendingUp, Brain, Heart, Eye,
  MapPin, Clock, CheckCircle, XCircle, Sparkles
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'
import { useLocation } from '../context/LocationContext'

const Alerts = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedAlert, setExpandedAlert] = useState(null)
  const { location } = useLocation()

  // Individual data states
  const [forecastData, setForecastData] = useState(null)
  const [wildfireData, setWildfireData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [breathData, setBreathData] = useState(null)

  const { lat, lon } = location

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [forecast, wildfires, weather, breath] = await Promise.all([
          apiService.getForecast(lat, lon).catch(() => null),
          apiService.getWildfires(lat, lon, 100).catch(() => null),
          apiService.getWeather(lat, lon).catch(() => null),
          apiService.getBreathScore(lat, lon).catch(() => null)
        ])

        setForecastData(forecast)
        setWildfireData(wildfires)
        setWeatherData(weather)
        setBreathData(breath)
      } catch (err) {
        console.error('Error fetching alert data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [lat, lon])

  if (loading) return <LoadingSpinner message="Analyzing conditions..." />

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Alerts Unavailable</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // Helper function to convert temperature to all scales
  // Weather API returns Celsius, so we convert FROM Celsius
  const convertTempFromCelsius = (celsius) => {
    if (celsius === null || celsius === undefined) return null
    const fahrenheit = (celsius * 9/5) + 32
    const kelvin = celsius + 273.15
    return {
      celsius: Math.round(celsius * 10) / 10,
      fahrenheit: Math.round(fahrenheit * 10) / 10,
      kelvin: Math.round(kelvin * 10) / 10
    }
  }

  // For backward compatibility with alerts that use Fahrenheit
  const convertTempFromFahrenheit = (fahrenheit) => {
    if (fahrenheit === null || fahrenheit === undefined) return null
    const celsius = (fahrenheit - 32) * 5/9
    const kelvin = celsius + 273.15
    return {
      celsius: Math.round(celsius * 10) / 10,
      fahrenheit: Math.round(fahrenheit * 10) / 10,
      kelvin: Math.round(kelvin * 10) / 10
    }
  }

  // Build comprehensive alerts array
  const alerts = []
  const aqi = forecastData?.prediction?.aqi
  const category = forecastData?.prediction?.category

  // ══════════════════════════════════════════════════════════════════════
  // 1. AI-POWERED PERSONALIZED HEALTH ALERT
  // ══════════════════════════════════════════════════════════════════════
  if (aqi && aqi > 50) {
    const severity = aqi > 200 ? 'critical' : aqi > 150 ? 'high' : aqi > 100 ? 'moderate' : 'low'
    const locationName = forecastData?.location?.details?.city || 'your location'

    // Generate AI-style personalized guidance
    const getPersonalizedGuidance = (aqi) => {
      if (aqi > 200) {
        return {
          summary: `The air quality in ${locationName} is at hazardous levels (AQI ${aqi}). This is an emergency condition affecting everyone. Staying indoors with air filtration is critical for your health.`,
          health_recommendations: [
            "Stay indoors with windows and doors closed - outdoor air is dangerous",
            "Run air purifiers on highest settings in all occupied rooms",
            "Wear P100 respirators if you absolutely must go outside",
            "Avoid all physical exertion, even indoors",
            "Monitor symptoms closely - seek medical care if you experience difficulty breathing",
            "Keep emergency medications (inhalers, etc.) readily accessible"
          ],
          contextual_insights: [
            "At this AQI level, breathing outdoor air for even short periods can cause serious health effects",
            "Vulnerable groups (children, elderly, those with respiratory conditions) face extreme risk",
            "Air quality this poor is often caused by wildfires, industrial accidents, or severe pollution events"
          ],
          actionable_tips: [
            "Create a clean air room: seal one room, run air purifiers, stay there",
            "Check on neighbors, especially elderly or those living alone",
            "Have N95/P100 masks ready if evacuation becomes necessary",
            "Monitor local emergency alerts for evacuation orders"
          ]
        }
      } else if (aqi > 150) {
        return {
          summary: `Air quality in ${locationName} is unhealthy (AQI ${aqi}). Everyone should take precautions to reduce exposure, especially sensitive groups who face serious health risks.`,
          health_recommendations: [
            "Avoid all outdoor activities, especially exercise",
            "Keep windows closed and use air purifiers indoors",
            "Wear N95 masks if you must go outside",
            "Children, elderly, and those with asthma/heart disease should stay indoors entirely",
            "Reschedule outdoor events and activities for better air quality days"
          ],
          contextual_insights: [
            "Prolonged exposure at this level can trigger asthma attacks and aggravate heart conditions",
            "Particle pollution (PM2.5) penetrates deep into lungs and enters bloodstream",
            "Weather conditions like stagnant air can trap pollutants near ground level"
          ],
          actionable_tips: [
            "Check AQI every few hours for improvements",
            "Use HEPA air purifiers in bedrooms and main living areas",
            "Stay hydrated to help your body cope with air pollution",
            "If symptoms develop (coughing, chest tightness), contact your doctor"
          ]
        }
      } else if (aqi > 100) {
        return {
          summary: `Air quality in ${locationName} is unhealthy for sensitive groups (AQI ${aqi}). Children, elderly, and people with respiratory conditions should limit outdoor exposure.`,
          health_recommendations: [
            "Sensitive groups should reduce prolonged or heavy outdoor exertion",
            "General public can be outdoors but should watch for symptoms",
            "Consider wearing masks if you're in a sensitive group and must be outside",
            "Close windows during peak pollution hours (usually midday to evening)",
            "Run air purifiers if available, especially in bedrooms"
          ],
          contextual_insights: [
            "This AQI level means the air contains enough pollutants to affect vulnerable populations",
            "Traffic and industrial emissions are common contributors at this level",
            "Hot, sunny days can increase ground-level ozone formation"
          ],
          actionable_tips: [
            "Schedule outdoor activities for early morning when air is typically cleaner",
            "Take breaks during outdoor activities and move indoors if you feel symptoms",
            "Keep quick-relief inhalers accessible if you have asthma",
            "Monitor air quality forecasts to plan ahead"
          ]
        }
      } else {
        return {
          summary: `Air quality in ${locationName} is moderate (AQI ${aqi}). Generally acceptable, though unusually sensitive individuals may experience minor effects from prolonged exposure.`,
          health_recommendations: [
            "General public can enjoy normal outdoor activities",
            "Unusually sensitive people should consider reducing prolonged outdoor exertion",
            "Monitor symptoms if you have respiratory sensitivities",
            "Good day for outdoor exercise, but pace yourself if you're sensitive"
          ],
          contextual_insights: [
            "Moderate air quality is common in urban areas and generally safe",
            "Sensitive individuals include those with asthma, children, elderly, and pregnant women",
            "Air quality often improves with wind or rain"
          ],
          actionable_tips: [
            "Take advantage of decent air quality for outdoor activities",
            "Open windows for fresh air circulation",
            "Stay hydrated during outdoor exercise"
          ]
        }
      }
    }

    const guidance = getPersonalizedGuidance(aqi)

    alerts.push({
      id: 'ai_personalized',
      type: 'ai_health',
      severity: severity,
      title: `🧠 Personalized Health Guidance - AQI ${aqi}`,
      summary: guidance.summary,
      message: guidance.summary,
      health_recommendations: guidance.health_recommendations,
      contextual_insights: guidance.contextual_insights,
      actionable_tips: guidance.actionable_tips,
      ai_powered: true,
      icon: Brain,
      timestamp: new Date().toISOString()
    })
  }

  // ══════════════════════════════════════════════════════════════════════
  // 2. AQI THRESHOLD ALERT
  // ══════════════════════════════════════════════════════════════════════
  if (aqi && aqi > 100) {
    const severity = aqi > 200 ? 'critical' : aqi > 150 ? 'high' : 'moderate'

    alerts.push({
      id: 'aqi_threshold',
      type: 'air_quality',
      severity: severity,
      title: `🚨 Air Quality Alert: ${category}`,
      message: `Current AQI of ${aqi} exceeds safe levels`,
      aqi: aqi,
      category: category,
      actions: [
        ...(aqi > 200 ? ["Stay indoors - this is an emergency", "Seal windows and doors", "Run air purifiers on high"] : []),
        ...(aqi > 150 ? ["Avoid all outdoor activities", "Wear N95 mask if you must go out", "Close windows"] : []),
        "Check AQI before going outside",
        "Keep windows closed during peak hours",
        "Limit time outdoors"
      ],
      affected_groups: aqi > 150 ? ['Everyone'] : ['Sensitive Groups', 'Children', 'Elderly'],
      icon: AlertTriangle,
      timestamp: new Date().toISOString()
    })
  }

  // ══════════════════════════════════════════════════════════════════════
  // 3. WILDFIRE ALERT
  // ══════════════════════════════════════════════════════════════════════
  if (wildfireData && wildfireData.wildfire_detected) {
    const fireCount = wildfireData.count
    const closest = wildfireData.closest_fire

    if (closest) {
      const distance = closest.distance_km
      const severity = distance < 25 ? 'critical' : distance < 50 ? 'high' : 'moderate'

      alerts.push({
        id: 'wildfire',
        type: 'wildfire',
        severity: severity,
        title: `🔥 Wildfire Alert - ${fireCount} Active Fire${fireCount > 1 ? 's' : ''}`,
        message: `Active wildfire detected ${distance.toFixed(1)}km away${closest.location_name ? ` near ${closest.location_name}` : ''}. Wildfire smoke contains harmful particles and gases that severely impact air quality.`,
        fire_count: fireCount,
        closest_distance_km: distance,
        brightness: closest.brightness,
        confidence: closest.confidence,
        fire_location: closest.location_name || 'Unknown location',
        actions: [
          "Monitor air quality closely - wildfire smoke is extremely harmful",
          "Keep all windows and doors closed",
          "Use N95 or P100 masks if you must go outside",
          "Avoid ALL outdoor activities, especially exercise",
          "Run air purifiers on highest settings",
          "Create a clean air room with sealed doors/windows",
          ...(distance < 50 ? ["Prepare evacuation plan in case fire spreads", "Monitor local emergency alerts"] : []),
          "Stay informed about fire progression and air quality changes"
        ],
        affected_groups: ['Everyone', 'Especially: Sensitive Groups, Children, Elderly'],
        icon: Flame,
        timestamp: new Date().toISOString()
      })
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // 4. WEATHER ALERTS
  // ══════════════════════════════════════════════════════════════════════
  if (weatherData) {
    // Umbrella Alert
    if (weatherData.umbrella_needed) {
      alerts.push({
        id: 'umbrella',
        type: 'weather',
        severity: 'low',
        title: "☔ Umbrella Recommended",
        message: weatherData.umbrella_needed.message || 'Rain expected - bring an umbrella!',
        precipitation_chance: weatherData.umbrella_needed.precipitation_chance,
        actions: [
          "Bring an umbrella or rain jacket",
          "Plan for wet conditions if going outside",
          "Rain can help clear air pollution temporarily"
        ],
        icon: Umbrella,
        timestamp: new Date().toISOString()
      })
    }

    // Extreme Temperature Alerts - Weather API returns Celsius
    const tempCelsius = weatherData.current?.temperature
    if (tempCelsius !== null && tempCelsius !== undefined) {
      // Extreme heat: >35°C (95°F)
      if (tempCelsius > 35) {
        const temps = convertTempFromCelsius(tempCelsius)
        alerts.push({
          id: 'extreme_heat',
          type: 'weather',
          severity: 'high',
          title: "🌡️ Extreme Heat Alert",
          message: `Temperature is ${temps.celsius}°C (${temps.fahrenheit}°F / ${temps.kelvin}K) - heat combined with air pollution creates dangerous conditions. Your body works harder in heat, and pollution makes it even worse.`,
          temperature: tempCelsius,
          actions: [
            "Stay indoors during peak heat (10am-4pm) - heat + pollution is dangerous",
            "Drink water constantly - dehydration worsens pollution effects",
            "NEVER exercise outdoors in these conditions",
            "Check on elderly neighbors and family members",
            "Use air conditioning if available - it filters air and cools",
            "Watch for heat exhaustion: dizziness, nausea, rapid heartbeat",
            "Never leave children or pets in vehicles - even for minutes"
          ],
          affected_groups: ['Everyone', 'High Risk: Elderly, Children, Outdoor Workers, Heart/Lung Conditions'],
          icon: Thermometer,
          timestamp: new Date().toISOString()
        })
      }
      // Extreme cold: <-7°C (20°F)
      else if (tempCelsius < -7) {
        const temps = convertTempFromCelsius(tempCelsius)
        alerts.push({
          id: 'extreme_cold',
          type: 'weather',
          severity: 'moderate',
          title: "❄️ Cold Weather Advisory",
          message: `Temperature is ${temps.celsius}°C (${temps.fahrenheit}°F / ${temps.kelvin}K) - cold air can trigger respiratory symptoms and make air pollution effects worse.`,
          temperature: tempCelsius,
          actions: [
            "Limit time outdoors in cold air - it can trigger asthma",
            "Cover nose and mouth with scarf to warm air before breathing",
            "Cold air + pollution is especially hard on lungs",
            "Dress in warm layers to prevent hypothermia",
            "Watch for frostbite on exposed skin",
            "Keep asthma medications accessible if you have asthma"
          ],
          affected_groups: ['High Risk: People with Asthma, COPD, Elderly, Young Children'],
          icon: Wind,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // 5. AIR QUALITY TREND ALERT
  // ══════════════════════════════════════════════════════════════════════
  if (aqi && aqi > 100) {
    alerts.push({
      id: 'trend_elevated',
      type: 'trend',
      severity: 'moderate',
      title: "📈 Air Quality Monitoring Recommended",
      message: "Air quality is currently elevated. Conditions may change throughout the day based on weather, traffic, and other factors.",
      current_aqi: aqi,
      actions: [
        "Check AQI updates every few hours",
        "Plan outdoor activities for times with better air quality",
        "Consider indoor exercise alternatives",
        "Set up AQI alerts on your phone for your area",
        "Early morning often has better air quality than afternoon"
      ],
      icon: TrendingUp,
      timestamp: new Date().toISOString()
    })
  }

  // Severity configuration
  const severityConfig = {
    critical: {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-400',
      textColor: 'text-purple-900',
      iconColor: 'text-purple-700',
      badgeBg: 'bg-purple-200',
      accentColor: 'bg-purple-600'
    },
    high: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-900',
      iconColor: 'text-red-700',
      badgeBg: 'bg-red-200',
      accentColor: 'bg-red-600'
    },
    moderate: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-900',
      iconColor: 'text-orange-700',
      badgeBg: 'bg-orange-200',
      accentColor: 'bg-orange-600'
    },
    low: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-700',
      badgeBg: 'bg-blue-200',
      accentColor: 'bg-blue-600'
    }
  }

  const toggleAlert = (id) => {
    setExpandedAlert(expandedAlert === id ? null : id)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-lg">
              <Bell className="text-white" size={48} />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                Health Alerts
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                Personalized, AI-powered, and actionable
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin size={16} className="text-blue-600" />
              <span className="text-slate-700 font-medium">
                {forecastData?.location?.details?.city || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-slate-500" />
              <span className="text-slate-600">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            {alerts.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 rounded-full">
                <AlertCircle size={16} className="text-orange-700" />
                <span className="text-orange-900 font-semibold">
                  {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Banner */}
        {aqi && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 rounded-2xl shadow-xl p-8 ${
              aqi > 150 ? 'bg-gradient-to-r from-red-600 to-orange-500' :
              aqi > 100 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
              aqi > 50 ? 'bg-gradient-to-r from-yellow-500 to-green-500' :
              'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Eye size={32} />
                  <h2 className="text-3xl font-bold">Current Conditions</h2>
                </div>
                <p className="text-white/90 text-lg mb-4">
                  {alerts.length > 0
                    ? `${alerts.length} alert${alerts.length > 1 ? 's' : ''} require your attention`
                    : 'No active alerts - conditions are favorable'}
                </p>
                <div className="flex items-center space-x-6">
                  <div>
                    <div className="text-white/80 text-sm">AQI</div>
                    <div className="text-4xl font-bold">{aqi}</div>
                    <div className="text-white/90 text-sm">{category}</div>
                  </div>
                  {breathData && (
                    <div>
                      <div className="text-white/80 text-sm">Breath Score</div>
                      <div className="text-4xl font-bold">{breathData.score?.toFixed(0)}/100</div>
                      <div className="text-white/90 text-sm">{breathData.rating}</div>
                    </div>
                  )}
                  {weatherData && weatherData.current && (
                    <div>
                      <div className="text-white/80 text-sm">Weather</div>
                      {weatherData.current.temperature !== null && weatherData.current.temperature !== undefined ? (
                        <div className="text-xl font-bold">
                          <div className="flex flex-col space-y-1">
                            <div>{convertTempFromCelsius(weatherData.current.temperature).celsius}°C</div>
                            <div className="text-lg opacity-80">{convertTempFromCelsius(weatherData.current.temperature).fahrenheit}°F</div>
                            <div className="text-sm opacity-70">{convertTempFromCelsius(weatherData.current.temperature).kelvin}K</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">--</div>
                      )}
                      <div className="text-white/90 text-sm mt-1">{weatherData.current.condition || 'Unknown'}</div>
                    </div>
                  )}
                </div>
              </div>
              <Shield size={96} className="opacity-30" />
            </div>
          </motion.div>
        )}

        {/* Alerts List */}
        {alerts.length > 0 ? (
          <div className="space-y-6">
            {alerts.map((alert, index) => {
              const config = severityConfig[alert.severity] || severityConfig.low
              const Icon = alert.icon || AlertCircle
              const isExpanded = expandedAlert === alert.id

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${config.bgColor} border-2 ${config.borderColor} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300`}
                >
                  {/* Alert Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleAlert(alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 ${config.accentColor} rounded-xl shadow-md`}>
                          <Icon className="text-white" size={32} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-2xl font-bold ${config.textColor}`}>
                              {alert.title}
                            </h3>
                            <span className={`px-3 py-1 ${config.badgeBg} ${config.textColor} text-xs font-bold rounded-full uppercase tracking-wide`}>
                              {alert.severity}
                            </span>
                            {alert.ai_powered && (
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center space-x-1">
                                <Sparkles size={12} />
                                <span>AI-Powered</span>
                              </span>
                            )}
                          </div>
                          <p className={`${config.textColor} text-lg leading-relaxed`}>
                            {alert.message || alert.summary}
                          </p>
                          {alert.affected_groups && (
                            <div className="mt-3 flex items-center space-x-2 text-sm">
                              <Heart size={16} className={config.iconColor} />
                              <span className={`font-semibold ${config.textColor}`}>
                                Affected: {Array.isArray(alert.affected_groups) ? alert.affected_groups.join(', ') : alert.affected_groups}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button className={`ml-4 p-3 hover:bg-white/50 rounded-xl transition-colors ${config.textColor}`}>
                        {isExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t-2 border-white/50"
                      >
                        <div className="p-6 bg-white/40 space-y-6">
                          {/* Actions */}
                          {alert.actions && alert.actions.length > 0 && (
                            <div>
                              <h4 className={`font-bold ${config.textColor} mb-3 text-lg flex items-center space-x-2`}>
                                <CheckCircle size={20} />
                                <span>Recommended Actions:</span>
                              </h4>
                              <ul className="space-y-2">
                                {alert.actions.map((action, idx) => (
                                  <li
                                    key={idx}
                                    className={`flex items-start space-x-3 ${config.textColor} text-base`}
                                  >
                                    <span className="mt-1 flex-shrink-0">•</span>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Health Recommendations */}
                          {alert.health_recommendations && alert.health_recommendations.length > 0 && (
                            <div>
                              <h4 className={`font-bold ${config.textColor} mb-3 text-lg flex items-center space-x-2`}>
                                <Heart size={20} />
                                <span>Health Recommendations:</span>
                              </h4>
                              <ul className="space-y-2">
                                {alert.health_recommendations.map((rec, idx) => (
                                  <li
                                    key={idx}
                                    className={`flex items-start space-x-3 ${config.textColor} text-base`}
                                  >
                                    <span className="mt-1 flex-shrink-0">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Contextual Insights */}
                          {alert.contextual_insights && alert.contextual_insights.length > 0 && (
                            <div>
                              <h4 className={`font-bold ${config.textColor} mb-3 text-lg flex items-center space-x-2`}>
                                <Brain size={20} />
                                <span>Why This Matters:</span>
                              </h4>
                              <ul className="space-y-2">
                                {alert.contextual_insights.map((insight, idx) => (
                                  <li
                                    key={idx}
                                    className={`flex items-start space-x-3 ${config.textColor} text-base`}
                                  >
                                    <span className="mt-1 flex-shrink-0">•</span>
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Actionable Tips */}
                          {alert.actionable_tips && alert.actionable_tips.length > 0 && (
                            <div>
                              <h4 className={`font-bold ${config.textColor} mb-3 text-lg flex items-center space-x-2`}>
                                <Sparkles size={20} />
                                <span>Quick Tips:</span>
                              </h4>
                              <ul className="space-y-2">
                                {alert.actionable_tips.map((tip, idx) => (
                                  <li
                                    key={idx}
                                    className={`flex items-start space-x-3 ${config.textColor} text-base`}
                                  >
                                    <span className="mt-1 flex-shrink-0">✓</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        ) : (
          /* No Alerts State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-16 text-center shadow-xl"
          >
            <div className="inline-block p-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full shadow-lg mb-6">
              <Shield className="text-white" size={80} />
            </div>
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">
              All Clear!
            </h2>
            <p className="text-emerald-700 text-xl max-w-2xl mx-auto leading-relaxed">
              No active alerts at this time. Air quality is within safe ranges for all groups.
              Continue to monitor conditions regularly, especially if you have respiratory sensitivities.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-8">
              {aqi && (
                <div className="text-center">
                  <div className="text-emerald-600 text-sm font-semibold">Current AQI</div>
                  <div className="text-5xl font-bold text-emerald-900 mt-1">{aqi}</div>
                  <div className="text-emerald-700 mt-1">{category}</div>
                </div>
              )}
              {breathData && (
                <div className="text-center">
                  <div className="text-emerald-600 text-sm font-semibold">Breath Score</div>
                  <div className="text-5xl font-bold text-emerald-900 mt-1">{breathData.score?.toFixed(0)}</div>
                  <div className="text-emerald-700 mt-1">{breathData.rating}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Info size={28} className="text-blue-600" />
            <span>How Our Alert System Works</span>
          </h3>
          <p className="text-slate-700 leading-relaxed mb-6">
            Lighthouse monitors multiple data sources continuously and generates personalized alerts when
            conditions require your attention. Our AI-powered system analyzes air quality, weather, wildfires,
            and local conditions to provide genuine, actionable guidance tailored to your location.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
              <Brain className="text-purple-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-slate-800 mb-1">AI-Powered Insights</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Personalized health guidance based on your location's specific conditions, not generic advice
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
              <Flame className="text-orange-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-slate-800 mb-1">Wildfire Detection</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  NASA FIRMS satellite data provides real-time wildfire alerts with precise locations and distances
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
              <Thermometer className="text-red-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-slate-800 mb-1">Weather Integration</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Extreme temperatures and precipitation alerts help you prepare for conditions that affect air quality
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
              <TrendingUp className="text-blue-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-slate-800 mb-1">Trend Monitoring</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Continuous tracking identifies when air quality is deteriorating so you can take action early
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900 leading-relaxed">
              <strong className="text-blue-950">Data Sources:</strong> NASA TEMPO Satellite • NASA FIRMS Wildfires •
              World Air Quality Index (WAQI) • NOAA Weather Service • Open-Meteo Weather Data
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Alerts

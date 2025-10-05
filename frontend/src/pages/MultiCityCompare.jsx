/**
 * MultiCityCompare Page
 *
 * Compare air quality across multiple cities side-by-side
 * Features:
 * - 2-3 city comparison
 * - AQI, Breath Score, Weather for each
 * - Visual comparison charts
 * - Mask recommendations
 * - Rain forecasts
 * - Wildfire alerts
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Shield,
  CloudRain,
  AlertTriangle,
  Plus,
  X,
  ArrowRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { apiService } from '../services/api'
import LocationSelector from '../components/LocationSelector'
import { getAQIColor, getAQILabel } from '../utils/aqi'

const MultiCityCompare = () => {
  const [cities, setCities] = useState([
    { lat: 34.05, lon: -118.24, name: 'Los Angeles, USA' },
    { lat: 40.7128, lon: -74.0060, name: 'New York, USA' }
  ])
  const [compareData, setCompareData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchComparisonData()
  }, [cities])

  const fetchComparisonData = async () => {
    if (cities.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await apiService.multiCompare(cities)
      setCompareData(response)
    } catch (err) {
      console.error('Error fetching comparison:', err)
      setError('Failed to load comparison data')
    } finally {
      setLoading(false)
    }
  }

  const addCity = () => {
    if (cities.length < 3) {
      setCities([...cities, { lat: 51.5074, lon: -0.1278, name: 'London, UK' }])
    }
  }

  const removeCity = (index) => {
    if (cities.length > 1) {
      setCities(cities.filter((_, i) => i !== index))
    }
  }

  const updateCity = (index, lat, lon, name) => {
    const newCities = [...cities]
    newCities[index] = { lat, lon, name }
    setCities(newCities)
  }

  // Prepare chart data
  const aqiChartData = compareData?.cities?.map(city => ({
    name: city.name?.split(',')[0] || 'Unknown',
    AQI: city.aqi || 0,
    'Breath Score': city.breath_score || 0
  })) || []

  const radarData = compareData?.cities?.map(city => ({
    city: city.name?.split(',')[0] || 'Unknown',
    AQI: Math.min(city.aqi || 0, 200),
    Temperature: city.weather?.temperature || 0,
    Humidity: city.weather?.humidity || 0,
    Wind: city.weather?.wind_speed || 0
  })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-gray-800 mb-4">
            Multi-City Air Quality Comparison
          </h1>
          <p className="text-xl text-gray-600">
            Compare air quality, weather, and health metrics across multiple locations
          </p>
        </motion.div>

        {/* City Selectors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={20} />
                    City {index + 1}
                  </h3>
                  {cities.length > 1 && (
                    <button
                      onClick={() => removeCity(index)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="text-red-500" size={20} />
                    </button>
                  )}
                </div>
                <LocationSelector
                  currentLocation={city}
                  onLocationChange={(lat, lon, name) => updateCity(index, lat, lon, name)}
                />
              </div>
            ))}

            {/* Add City Button */}
            {cities.length < 3 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addCity}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors flex flex-col items-center justify-center gap-3 min-h-[150px]"
              >
                <Plus className="text-blue-600" size={32} />
                <span className="text-blue-600 font-semibold">Add Another City</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading comparison data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-3" size={48} />
            <p className="text-red-800 text-lg font-semibold">{error}</p>
          </div>
        )}

        {/* Comparison Results */}
        {!loading && !error && compareData && (
          <>
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {compareData.cities?.map((city, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate flex-1">
                      {city.name}
                    </h3>
                  </div>

                  {/* AQI Display */}
                  <div className={`mb-4 p-4 rounded-xl bg-gradient-to-r ${getAQIColor(city.aqi)}`}>
                    <div className="text-white">
                      <div className="text-sm font-medium opacity-90 mb-1">Air Quality Index</div>
                      <div className="text-4xl font-black mb-1">{city.aqi || 'N/A'}</div>
                      <div className="text-sm font-semibold">{getAQILabel(city.aqi)}</div>
                    </div>
                  </div>

                  {/* Breath Score */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Breath Score</span>
                      <span className="text-2xl font-bold text-blue-600">{city.breath_score || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Mask Recommendation */}
                  <div className={`mb-4 p-4 rounded-xl ${city.mask_needed ? 'bg-orange-50' : 'bg-green-50'}`}>
                    <div className="flex items-center gap-3">
                      <Shield className={city.mask_needed ? 'text-orange-600' : 'text-green-600'} size={20} />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {city.mask_needed ? 'Mask Recommended' : 'No Mask Needed'}
                        </div>
                        {city.mask_type && (
                          <div className="text-xs text-gray-600">{city.mask_type}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Weather */}
                  {city.weather && (
                    <div className="mb-4 p-4 bg-cyan-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-700 mb-2">Weather</div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-cyan-600">
                          {city.weather.temperature}°
                        </span>
                        <span className="text-sm text-gray-600">{city.weather.conditions}</span>
                      </div>
                    </div>
                  )}

                  {/* Rain Forecast */}
                  {city.rain_expected && (
                    <div className="p-4 bg-blue-100 rounded-xl flex items-center gap-3">
                      <CloudRain className="text-blue-600" size={20} />
                      <span className="text-sm font-semibold text-blue-800">Rain Expected</span>
                    </div>
                  )}

                  {/* Wildfire Alert */}
                  {city.wildfire_alert && (
                    <div className="mt-4 p-4 bg-red-100 rounded-xl flex items-center gap-3">
                      <AlertTriangle className="text-red-600" size={20} />
                      <span className="text-sm font-semibold text-red-800">Wildfire Nearby</span>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Comparison Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">AQI & Breath Score Comparison</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aqiChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="AQI" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Breath Score" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Best & Worst */}
            {compareData.best_city && compareData.worst_city && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Best City */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-green-600" size={32} />
                    <h3 className="text-2xl font-bold text-green-800">Best Air Quality</h3>
                  </div>
                  <div className="text-3xl font-black text-green-900 mb-2">
                    {compareData.best_city.name}
                  </div>
                  <div className="text-lg text-green-700">
                    AQI: {compareData.best_city.aqi}
                  </div>
                  <p className="mt-4 text-green-800">
                    {compareData.best_city.reason || 'Lowest AQI among compared cities'}
                  </p>
                </div>

                {/* Worst City */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="text-red-600" size={32} />
                    <h3 className="text-2xl font-bold text-red-800">Needs Attention</h3>
                  </div>
                  <div className="text-3xl font-black text-red-900 mb-2">
                    {compareData.worst_city.name}
                  </div>
                  <div className="text-lg text-red-700">
                    AQI: {compareData.worst_city.aqi}
                  </div>
                  <p className="mt-4 text-red-800">
                    {compareData.worst_city.reason || 'Highest AQI among compared cities'}
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MultiCityCompare

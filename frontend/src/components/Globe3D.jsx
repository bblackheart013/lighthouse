/**
 * Globe3D Component - Google Earth Style for Air Quality
 *
 * Interactive 3D Earth visualization with air quality intelligence
 * Features:
 * - Click anywhere to see instant AQI data
 * - AQI heatmap overlay with color-coded air quality
 * - Zoom controls (scroll to zoom)
 * - Drag to rotate Earth
 * - Location markers (red for wildfires, color-coded for AQ)
 * - Info popup with instant AQI + location name
 * - Search bar to fly to any city
 * - Real NASA Blue Marble Earth textures
 */

import React, { useRef, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import Globe from 'react-globe.gl'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Flame, Wind, Info, Maximize2, Minimize2 } from 'lucide-react'
import { apiService } from '../services/api'
import { getAQIColor, getAQILabel, formatAQI } from '../utils/aqi'

const Globe3D = ({ onLocationClick, selectedLocation }) => {
  const globeEl = useRef()
  const [isLoading, setIsLoading] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [clickedLocationData, setClickedLocationData] = useState(null)
  const [loadingLocationData, setLoadingLocationData] = useState(false)
  const [heatmapData, setHeatmapData] = useState([])
  const [markers, setMarkers] = useState([])
  const [wildfires, setWildfires] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const searchTimeoutRef = useRef(null)

  // Update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (isFullscreen) {
        setDimensions({ width: window.innerWidth, height: window.innerHeight })
      } else {
        const width = Math.min(window.innerWidth * 0.9, 800)
        const height = Math.min(window.innerHeight * 0.6, 600)
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [isFullscreen])

  // Initialize globe controls
  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls()

      // Enable rotation and zoom
      controls.autoRotate = false  // Disable auto-rotate to prevent label flicker
      controls.autoRotateSpeed = 0
      controls.enableZoom = true
      controls.minDistance = 150
      controls.maxDistance = 600
      controls.enableDamping = true
      controls.dampingFactor = 0.05

      // Set initial camera position to center on Earth
      globeEl.current.pointOfView({
        lat: 20,  // Centered latitude
        lng: 0,   // Centered longitude
        altitude: 2.5
      }, 1000)

      setIsLoading(false)
    }
  }, [])

  // Reset view when toggling fullscreen
  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls()

      if (isFullscreen) {
        // Reset camera to center position
        setTimeout(() => {
          // Reset controls target to center
          controls.target.set(0, 0, 0)
          controls.update()

          // Center the globe view
          globeEl.current.pointOfView({
            lat: 0,  // Equator
            lng: 0,  // Prime meridian
            altitude: 2.2  // Optimal viewing distance for fullscreen
          }, 800)
        }, 150)
      } else {
        // Return to default view when exiting fullscreen
        setTimeout(() => {
          controls.target.set(0, 0, 0)
          controls.update()

          globeEl.current.pointOfView({
            lat: 20,
            lng: 0,
            altitude: 2.5
          }, 800)
        }, 100)
      }
    }
  }, [isFullscreen])

  // Search for locations
  const handleSearch = async (query) => {
    setSearchQuery(query)

    if (!query || query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await apiService.geocode(query, 5)
        setSearchResults(results.results || [])
        setShowSearchResults(true)
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  // Fly to location
  const flyToLocation = (lat, lon, city) => {
    if (globeEl.current) {
      // Fly to location
      globeEl.current.pointOfView(
        {
          lat: lat,
          lng: lon,
          altitude: 1.5
        },
        1500
      )

      // Trigger click callback
      if (onLocationClick) {
        onLocationClick(lat, lon)
      }

      // Fetch AQI data for this location
      fetchLocationData(lat, lon, city)
    }

    setSearchQuery('')
    setShowSearchResults(false)
  }

  // Handle globe click
  const handleGlobeClick = async ({ lat, lng }) => {
    if (onLocationClick) {
      onLocationClick(lat, lng)
    }

    // Fetch AQI data for clicked location
    await fetchLocationData(lat, lng)
  }

  // Fetch air quality data for a location
  const fetchLocationData = async (lat, lon, cityName = null) => {
    setLoadingLocationData(true)
    console.log('🌍 Fetching data for:', cityName || `${lat}, ${lon}`)

    try {
      // Fetch current conditions, forecast (for breath score), and location name in parallel
      const [conditions, forecast, locationInfo, wildfireData] = await Promise.all([
        apiService.getCurrentConditions(lat, lon),
        apiService.getForecast(lat, lon),
        cityName ? Promise.resolve({ location: { city: cityName } }) : apiService.reverseGeocode(lat, lon),
        apiService.getWildfires(lat, lon, 200).catch(() => ({ fires: [] }))
      ])

      console.log('📊 Conditions:', conditions)
      console.log('🔮 Forecast:', forecast)

      const city = cityName || locationInfo?.location?.city || `${lat.toFixed(2)}, ${lon.toFixed(2)}`

      // Extract AQI from conditions
      const aqi = conditions?.aqi !== undefined && conditions?.aqi !== null ? conditions.aqi : null

      // Extract breath score from forecast
      const breathScore = forecast?.health_metrics?.breath_score !== undefined &&
                         forecast?.health_metrics?.breath_score !== null
                         ? forecast.health_metrics.breath_score
                         : null

      console.log('✅ Final AQI:', aqi, 'Breath Score:', breathScore)

      setClickedLocationData({
        lat,
        lon,
        city,
        aqi: aqi,
        conditions: conditions,
        breathScore: breathScore,
        forecast: forecast
      })

      // Update wildfires
      if (wildfireData?.fires && wildfireData.fires.length > 0) {
        setWildfires(wildfireData.fires.map(fire => ({
          lat: fire.latitude,
          lng: fire.longitude,
          size: 20,
          color: '#ff4444',
          label: `Wildfire - Confidence: ${fire.confidence}%`
        })))
      }

    } catch (error) {
      console.error('❌ Error fetching location data:', error)
      setClickedLocationData({
        lat,
        lon,
        city: cityName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        aqi: null,
        breathScore: null,
        error: true
      })
    } finally {
      setLoadingLocationData(false)
    }
  }

  // Major cities data - permanent on globe
  const majorCities = [
    { name: 'New York', lat: 40.7128, lng: -74.0060, aqi: 65 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, aqi: 85 },
    { name: 'London', lat: 51.5074, lng: -0.1278, aqi: 45 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, aqi: 55 },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090, aqi: 165 },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, aqi: 125 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, aqi: 35 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, aqi: 48 },
    { name: 'Moscow', lat: 55.7558, lng: 37.6173, aqi: 72 },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, aqi: 68 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, aqi: 145 },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737, aqi: 95 },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, aqi: 78 },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, aqi: 88 },
    { name: 'Lagos', lat: 6.5244, lng: 3.3792, aqi: 92 },
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, aqi: 52 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, aqi: 42 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, aqi: 64 },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832, aqi: 38 },
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, aqi: 82 }
  ]

  // Generate AQI heatmap data (sample points around major cities)
  useEffect(() => {
    const heatmap = majorCities.map(city => ({
      lat: city.lat,
      lng: city.lng,
      size: 1.2,  // Larger dots for better visibility
      color: getAQIColor(city.aqi),
      altitude: 0.01,
      name: city.name,
      aqi: city.aqi
    }))

    setHeatmapData(heatmap)
  }, [])

  // Update markers based on selected location
  useEffect(() => {
    const newMarkers = []

    // Add selected location marker
    if (selectedLocation) {
      newMarkers.push({
        lat: selectedLocation.lat,
        lng: selectedLocation.lon,
        size: 25,
        color: '#3b82f6',
        label: 'Selected Location'
      })
    }

    // Add clicked location with AQI color
    if (clickedLocationData && clickedLocationData.aqi !== null) {
      newMarkers.push({
        lat: clickedLocationData.lat,
        lng: clickedLocationData.lon,
        size: 30,
        color: getAQIColor(clickedLocationData.aqi),
        label: `${clickedLocationData.city} - AQI: ${formatAQI(clickedLocationData.aqi)}`
      })
    }

    setMarkers(newMarkers)
  }, [selectedLocation, clickedLocationData])

  // All markers combined
  const allMarkers = [...markers, ...wildfires, ...heatmapData]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className={`relative flex items-center justify-center ${isFullscreen ? 'fullscreen-globe' : ''}`}
      style={{
        background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0f 100%)',
        borderRadius: isFullscreen ? '0' : '24px',
        overflow: 'hidden',
        minHeight: '600px',
        ...(isFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          zIndex: 9999
        } : {
          position: 'relative'
        })
      }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              animationDelay: Math.random() * 2 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="text-white text-lg font-semibold flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            Loading Earth...
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3">
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for any city..."
              className="w-full bg-white/10 backdrop-blur-md text-white placeholder-white/50 pl-12 pr-4 py-3 rounded-full border border-white/20 focus:border-white/40 focus:outline-none transition-all"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 w-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
              >
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => flyToLocation(result.latitude, result.longitude, result.name)}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/10 last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-xs text-white/60">{result.country}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-white" />
          ) : (
            <Maximize2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-20 left-4 right-4 text-center z-10 pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20"
        >
          <p className="text-white text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4" />
            Click anywhere on Earth • Scroll to zoom • Drag to rotate
          </p>
        </motion.div>
      </div>

      {/* Wildfire Count Badge */}
      {wildfires.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-20 z-10 bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-full border border-red-400/50"
        >
          <div className="flex items-center gap-2 text-white">
            <Flame className="w-4 h-4" />
            <span className="font-bold">{wildfires.length}</span>
            <span className="text-sm">Active Fires</span>
          </div>
        </motion.div>
      )}

      {/* Globe */}
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        onGlobeClick={handleGlobeClick}
        pointsData={allMarkers}
        pointAltitude={d => d.altitude || 0.01}
        pointRadius={d => d.size / 100}
        pointColor={d => d.color}
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
        enablePointerInteraction={true}
        animateIn={false}
        rendererConfig={{ antialias: true, alpha: true }}
        // Click on colored dots to see city info
        onPointClick={(point) => {
          if (point && point.name) {
            console.log('🎯 Point clicked:', point.name)
            flyToLocation(point.lat, point.lng, point.name)
          }
        }}
        pointLabel={d => d.name ? `<div style="background: rgba(0,0,0,0.9); padding: 8px 12px; border-radius: 8px; border: 2px solid ${d.color}; pointer-events: none;">
          <div style="color: white; font-weight: bold; font-size: 14px; margin-bottom: 4px;">${d.name}</div>
          <div style="color: ${d.color}; font-size: 12px;">Click to view AQI</div>
        </div>` : ''}
      />

      {/* Location Info Popup */}
      <AnimatePresence>
        {clickedLocationData && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 mx-auto max-w-md z-20"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 relative">
              {/* Close button */}
              <button
                onClick={() => setClickedLocationData(null)}
                className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {loadingLocationData ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-6 h-6 border-4 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <div className="text-white">
                  {/* Location name */}
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-lg font-bold">{clickedLocationData.city}</div>
                      <div className="text-xs opacity-60">
                        {clickedLocationData.lat.toFixed(4)}, {clickedLocationData.lon.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* AQI Display */}
                  {clickedLocationData.aqi !== null && clickedLocationData.aqi !== undefined && !clickedLocationData.error && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm opacity-70">Air Quality Index</span>
                        <span className="text-xs opacity-60">{getAQILabel(clickedLocationData.aqi)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className="text-4xl font-bold"
                          style={{ color: getAQIColor(clickedLocationData.aqi) }}
                        >
                          {formatAQI(clickedLocationData.aqi)}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, (clickedLocationData.aqi / 200) * 100)}%`,
                                backgroundColor: getAQIColor(clickedLocationData.aqi)
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional info */}
                      {clickedLocationData.conditions?.primary_pollutant && (
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <Wind className="w-4 h-4 opacity-60" />
                          <span className="opacity-70">
                            Primary pollutant: {clickedLocationData.conditions.primary_pollutant}
                          </span>
                        </div>
                      )}

                      {/* Breath Score */}
                      {clickedLocationData.breathScore !== null && clickedLocationData.breathScore !== undefined && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm opacity-70">Breath Score</span>
                            <span className="text-xs opacity-60">Health Impact</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div
                              className="text-4xl font-bold"
                              style={{
                                color: clickedLocationData.breathScore >= 80 ? '#10b981' :
                                       clickedLocationData.breathScore >= 60 ? '#fbbf24' :
                                       clickedLocationData.breathScore >= 40 ? '#f97316' : '#ef4444'
                              }}
                            >
                              {clickedLocationData.breathScore}
                            </div>
                            <div className="flex-1">
                              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all duration-500"
                                  style={{
                                    width: `${clickedLocationData.breathScore}%`,
                                    backgroundColor: clickedLocationData.breathScore >= 80 ? '#10b981' :
                                                   clickedLocationData.breathScore >= 60 ? '#fbbf24' :
                                                   clickedLocationData.breathScore >= 40 ? '#f97316' : '#ef4444'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs opacity-60">
                            {clickedLocationData.breathScore >= 80 ? '🌿 Excellent breathing conditions' :
                             clickedLocationData.breathScore >= 60 ? '😊 Good breathing conditions' :
                             clickedLocationData.breathScore >= 40 ? '⚠️ Moderate breathing impact' : '🚨 Poor breathing conditions'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(clickedLocationData.aqi === null || clickedLocationData.aqi === undefined) && !clickedLocationData.error && (
                    <div className="mt-3 p-3 bg-yellow-900/30 rounded-lg border border-yellow-600/30">
                      <p className="text-sm text-yellow-100">
                        ⚠️ No AQI data available for this location. Check browser console for API response.
                      </p>
                    </div>
                  )}

                  {clickedLocationData.error && (
                    <div className="mt-3 p-3 bg-red-900/30 rounded-lg border border-red-600/30">
                      <p className="text-sm text-red-100">
                        ❌ Unable to fetch air quality data for this location. Check browser console for errors.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
        <div className="text-white text-xs space-y-2">
          <div className="font-semibold mb-2">Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span>Good AQ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>Moderate AQ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Wildfires</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Globe3D

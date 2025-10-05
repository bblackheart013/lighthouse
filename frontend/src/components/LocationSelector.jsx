/**
 * LocationSelector Component
 *
 * Global location picker that allows users to search for any city worldwide
 * or enter custom coordinates to view air quality data anywhere on Earth.
 *
 * Enhanced with live geocoding API for real-time location search
 */

import React, { useState, useEffect } from 'react'
import { MapPin, Search, Globe, X, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiService } from '../services/api'

const LocationSelector = ({ onLocationChange, currentLocation }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lat, setLat] = useState(currentLocation?.lat || '')
  const [lon, setLon] = useState(currentLocation?.lon || '')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [locationDetails, setLocationDetails] = useState(null)

  // Popular cities worldwide
  const popularCities = [
    { name: 'Los Angeles, USA', lat: 34.05, lon: -118.24 },
    { name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
    { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
    { name: 'Delhi, India', lat: 28.7041, lon: 77.1025 },
    { name: 'Beijing, China', lat: 39.9042, lon: 116.4074 },
    { name: 'São Paulo, Brazil', lat: -23.5505, lon: -46.6333 },
    { name: 'Mexico City, Mexico', lat: 19.4326, lon: -99.1332 },
    { name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357 },
    { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
    { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
    { name: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
    { name: 'Toronto, Canada', lat: 43.6532, lon: -79.3832 },
    { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
    { name: 'Jakarta, Indonesia', lat: -6.2088, lon: 106.8456 },
  ]

  // Live search with geocoding API
  useEffect(() => {
    const searchLocations = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await apiService.geocode(searchQuery, 8)
        setSearchResults(results.results || [])
      } catch (error) {
        console.error('Geocoding error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchLocations, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Get location details when coordinates change
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (currentLocation?.lat && currentLocation?.lon) {
        try {
          const details = await apiService.reverseGeocode(currentLocation.lat, currentLocation.lon)
          setLocationDetails(details)
        } catch (error) {
          console.error('Reverse geocoding error:', error)
        }
      }
    }
    fetchLocationDetails()
  }, [currentLocation])

  const filteredCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Show search results if searching, otherwise show filtered popular cities
  const displayResults = searchQuery.trim().length >= 2 ? searchResults : filteredCities

  const handleCitySelect = (city) => {
    onLocationChange(city.lat, city.lon, city.name)
    setIsOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSearchResultSelect = (result) => {
    const name = result.display_name || result.name || `${result.lat}, ${result.lon}`
    onLocationChange(result.lat, result.lon, name)
    setIsOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleCustomCoordinates = () => {
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)

    if (isNaN(latNum) || isNaN(lonNum)) {
      alert('Please enter valid coordinates')
      return
    }

    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      alert('Coordinates out of range. Latitude: -90 to 90, Longitude: -180 to 180')
      return
    }

    onLocationChange(latNum, lonNum, `${latNum.toFixed(2)}, ${lonNum.toFixed(2)}`)
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
      >
        <Globe className="w-5 h-5" />
        <div className="text-left">
          <span className="font-medium block">
            {locationDetails?.city || currentLocation?.city || 'Select Location'}
          </span>
          {locationDetails?.precision && (
            <span className="text-xs text-blue-100 block">
              ±{locationDetails.precision}m precision
            </span>
          )}
        </div>
      </button>
      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin size={28} />
                    <h2 className="text-2xl font-bold">Choose Location</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-96">
                {/* Search Results / Popular Cities */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                    <span>{searchQuery.trim().length >= 2 ? 'Search Results' : 'Popular Cities'}</span>
                    {isSearching && <Loader className="animate-spin text-blue-600" size={20} />}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchQuery.trim().length >= 2 ? (
                      // Display search results from geocoding API
                      searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchResultSelect(result)}
                          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                              {result.name}
                            </p>
                            <p className="text-xs text-slate-600 truncate">
                              {result.display_name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                            </p>
                          </div>
                          <MapPin className="text-slate-400 group-hover:text-blue-600 ml-2 flex-shrink-0" size={20} />
                        </button>
                      ))
                    ) : (
                      // Display popular cities
                      filteredCities.map((city) => (
                        <button
                          key={city.name}
                          onClick={() => handleCitySelect(city)}
                          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-blue-600">{city.name}</p>
                            <p className="text-sm text-slate-600">{city.lat.toFixed(2)}, {city.lon.toFixed(2)}</p>
                          </div>
                          <MapPin className="text-slate-400 group-hover:text-blue-600" size={20} />
                        </button>
                      ))
                    )}
                  </div>

                  {displayResults.length === 0 && !isSearching && (
                    <p className="text-center text-slate-500 py-8">
                      {searchQuery.trim().length >= 2
                        ? 'No locations found. Try a different search or use custom coordinates below.'
                        : 'No cities found. Try custom coordinates below.'}
                    </p>
                  )}
                </div>

                {/* Custom Coordinates */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Custom Coordinates</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Latitude (-90 to 90)
                        </label>
                        <input
                          type="number"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          placeholder="e.g., 34.05"
                          step="0.0001"
                          min="-90"
                          max="90"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Longitude (-180 to 180)
                        </label>
                        <input
                          type="number"
                          value={lon}
                          onChange={(e) => setLon(e.target.value)}
                          placeholder="e.g., -118.24"
                          step="0.0001"
                          min="-180"
                          max="180"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCustomCoordinates}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                    >
                      View Air Quality Here
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default LocationSelector

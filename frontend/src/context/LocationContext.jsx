/**
 * LocationContext - Global Location State Management
 *
 * This context provides location state (lat, lon, city) to all components
 * in the Lighthouse application. It allows users to change their location
 * globally and have all pages react to the change.
 *
 * Default location: New York City (40.7, -74.0)
 */

import React, { createContext, useContext, useState } from 'react'

const LocationContext = createContext()

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState({
    lat: 40.7,
    lon: -74.0,
    city: 'New York City, USA'
  })
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const setLocation = (lat, lon, city) => {
    setLocationState({ lat, lon, city })
  }

  // Auto-detect user's current location on mount
  React.useEffect(() => {
    const detectLocation = () => {
      if (navigator.geolocation && !isGettingLocation) {
        setIsGettingLocation(true)

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords

            // Reverse geocode to get city name
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
              )
              const data = await response.json()
              const city = data.features?.[0]?.place_name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`

              console.log('📍 Auto-detected location:', city)
              setLocationState({ lat: latitude, lon: longitude, city })
            } catch (error) {
              console.error('Error reverse geocoding:', error)
              setLocationState({
                lat: latitude,
                lon: longitude,
                city: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
              })
            }
            setIsGettingLocation(false)
          },
          (error) => {
            console.log('Location detection skipped:', error.message)
            setIsGettingLocation(false)
            // Keep default NYC location
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 300000 // Cache for 5 minutes
          }
        )
      }
    }

    // Detect location after a brief delay to avoid blocking initial render
    const timer = setTimeout(detectLocation, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export default LocationContext

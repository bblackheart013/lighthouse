/**
 * LocationContext - Global Location State Management
 *
 * This context provides location state (lat, lon, city) to all components
 * in the ClearSkies application. It allows users to change their location
 * globally and have all pages react to the change.
 *
 * Default location: Los Angeles (34.05, -118.24)
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
    lat: 34.05,
    lon: -118.24,
    city: 'Los Angeles, USA'
  })

  const setLocation = (lat, lon, city) => {
    setLocationState({ lat, lon, city })
  }

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export default LocationContext

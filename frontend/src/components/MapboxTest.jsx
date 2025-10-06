/**
 * Mapbox Test Component - Minimal implementation to verify Mapbox works
 */

import React, { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const MapboxTest = () => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (map.current) return // initialize map only once

    const token = import.meta.env.VITE_MAPBOX_TOKEN
    console.log('🗺️ Mapbox Token:', token ? `${token.substring(0, 20)}...` : 'MISSING!')

    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-118.24, 34.05], // Los Angeles
      zoom: 9
    })

    map.current.on('load', () => {
      console.log('✅ Mapbox loaded!')
    })

    map.current.on('error', (e) => {
      console.error('❌ Mapbox error:', e.error)
    })
  }, [])

  return (
    <div style={{ width: '100%', height: '600px', backgroundColor: '#f0f0f0' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default MapboxTest

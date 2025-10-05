/**
 * LiveDataFeed Component
 * Real-time data streaming visualization with cyberpunk aesthetic
 * Shows live updates from NASA TEMPO, OpenAQ, Weather, and Wildfire sources
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Satellite, Layers, Cloud, Flame, ChevronRight, X, Code } from 'lucide-react'

const LiveDataFeed = () => {
  const [feedItems, setFeedItems] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [refreshRate] = useState(60) // seconds
  const feedRef = useRef(null)

  // Data source configurations with colors
  const dataSources = {
    satellite: {
      name: 'NASA TEMPO',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      icon: Satellite,
      types: ['NO2 Reading', 'Aerosol Detection', 'Ozone Layer Scan', 'UV Index Update']
    },
    ground: {
      name: 'OpenAQ Ground',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      icon: Layers,
      types: ['PM2.5 Sensor', 'PM10 Sensor', 'O3 Monitor', 'CO Detector']
    },
    weather: {
      name: 'Weather Data',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      icon: Cloud,
      types: ['Temperature Update', 'Humidity Reading', 'Wind Speed', 'Pressure Update']
    },
    wildfire: {
      name: 'Wildfire Detection',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      icon: Flame,
      types: ['Hotspot Detected', 'Fire Perimeter', 'Smoke Plume', 'Alert Level']
    }
  }

  // Generate realistic mock data
  const generateFeedItem = () => {
    const sourceKeys = Object.keys(dataSources)
    const randomSource = sourceKeys[Math.floor(Math.random() * sourceKeys.length)]
    const source = dataSources[randomSource]
    const type = source.types[Math.floor(Math.random() * source.types.length)]

    // Generate realistic values based on source
    let value, unit, quality, rawData

    switch (randomSource) {
      case 'satellite':
        value = (Math.random() * 50 + 100).toFixed(2)
        unit = '10¹⁵ molecules/cm²'
        quality = value < 120 ? 'good' : value < 150 ? 'moderate' : 'elevated'
        rawData = {
          source: 'NASA TEMPO L2',
          latitude: (34.05 + (Math.random() - 0.5) * 0.1).toFixed(4),
          longitude: (-118.25 + (Math.random() - 0.5) * 0.1).toFixed(4),
          measurement: parseFloat(value),
          unit: unit,
          quality_flag: quality,
          confidence: (Math.random() * 20 + 80).toFixed(1) + '%',
          scan_time: new Date().toISOString(),
          pixel_resolution: '2.1 x 4.7 km'
        }
        break

      case 'ground':
        value = (Math.random() * 30 + 10).toFixed(1)
        unit = 'µg/m³'
        quality = value < 12 ? 'good' : value < 35 ? 'moderate' : 'unhealthy'
        rawData = {
          source: 'OpenAQ Network',
          station_id: `STN-${Math.floor(Math.random() * 9999)}`,
          parameter: type.split(' ')[0],
          value: parseFloat(value),
          unit: unit,
          coordinates: {
            latitude: (34.05 + (Math.random() - 0.5) * 0.1).toFixed(4),
            longitude: (-118.25 + (Math.random() - 0.5) * 0.1).toFixed(4)
          },
          aqi: Math.floor(Math.random() * 50 + 20),
          timestamp: new Date().toISOString(),
          averaging_period: '1 hour'
        }
        break

      case 'weather':
        value = type.includes('Temperature') ? (Math.random() * 20 + 60).toFixed(1) :
                type.includes('Humidity') ? (Math.random() * 40 + 40).toFixed(1) :
                type.includes('Wind') ? (Math.random() * 15 + 5).toFixed(1) :
                (Math.random() * 2 + 29.5).toFixed(2)
        unit = type.includes('Temperature') ? '°F' :
               type.includes('Humidity') ? '%' :
               type.includes('Wind') ? 'mph' : 'inHg'
        rawData = {
          source: 'NOAA Weather Service',
          station: `WS-${Math.floor(Math.random() * 999)}`,
          parameter: type.replace(' Update', '').replace(' Reading', ''),
          value: parseFloat(value),
          unit: unit,
          conditions: ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain'][Math.floor(Math.random() * 4)],
          visibility: (Math.random() * 5 + 5).toFixed(1) + ' mi',
          timestamp: new Date().toISOString(),
          forecast_confidence: (Math.random() * 10 + 85).toFixed(1) + '%'
        }
        break

      case 'wildfire':
        value = (Math.random() * 400 + 300).toFixed(0)
        unit = 'K'
        quality = value > 350 ? 'high' : value > 320 ? 'medium' : 'low'
        rawData = {
          source: 'FIRMS MODIS/VIIRS',
          detection_id: `FIRE-${Math.floor(Math.random() * 99999)}`,
          brightness: parseFloat(value),
          unit: unit,
          confidence: quality,
          coordinates: {
            latitude: (34.05 + (Math.random() - 0.5) * 2).toFixed(4),
            longitude: (-118.25 + (Math.random() - 0.5) * 2).toFixed(4)
          },
          frp: (Math.random() * 50 + 10).toFixed(1) + ' MW',
          scan_angle: (Math.random() * 60).toFixed(1) + '°',
          acq_date: new Date().toISOString().split('T')[0],
          acq_time: new Date().toTimeString().split(' ')[0],
          satellite: ['Terra', 'Aqua', 'SNPP', 'NOAA-20'][Math.floor(Math.random() * 4)]
        }
        break
    }

    return {
      id: Date.now() + Math.random(),
      source: randomSource,
      sourceName: source.name,
      type: type,
      value: value,
      unit: unit,
      quality: quality,
      timestamp: new Date(),
      color: source.color,
      bgColor: source.bgColor,
      borderColor: source.borderColor,
      icon: source.icon,
      rawData: rawData
    }
  }

  // Add new feed items periodically
  useEffect(() => {
    if (isPaused) return

    // Add initial items
    const initialItems = Array.from({ length: 5 }, () => generateFeedItem())
    setFeedItems(initialItems)

    // Add new items every 2-5 seconds
    const interval = setInterval(() => {
      const newItem = generateFeedItem()
      setFeedItems(prev => [newItem, ...prev].slice(0, 50)) // Keep last 50 items
    }, Math.random() * 3000 + 2000)

    return () => clearInterval(interval)
  }, [isPaused])

  // Format timestamp
  const formatTime = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 5) return 'just now'
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-black/40 backdrop-blur-xl rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/10"
      >
        {/* Header */}
        <div className="border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="text-cyan-400 animate-pulse" size={20} />
                <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-50 animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg tracking-wide">LIVE DATA FEED</h3>
                <div className="flex items-center gap-2 text-xs text-cyan-400/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Streaming • {refreshRate}s refresh</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                isPaused
                  ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`} />
                {isPaused ? 'PAUSED' : 'LIVE'}
              </div>
            </button>
          </div>
        </div>

        {/* Feed Container */}
        <div
          ref={feedRef}
          className="h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent"
        >
          <AnimatePresence mode="popLayout">
            {feedItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer ${item.bgColor} ${item.borderColor} border-l-2`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="p-3 flex items-start gap-3">
                    <div className="mt-1">
                      <Icon className={item.color} size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white/90 text-sm font-semibold">{item.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${item.bgColor} ${item.color} border ${item.borderColor}`}>
                            {item.sourceName}
                          </span>
                        </div>
                        <span className="text-white/40 text-xs whitespace-nowrap">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold font-mono ${item.color}`}>
                          {item.value}
                        </span>
                        <span className="text-white/50 text-xs">{item.unit}</span>
                        {item.quality && (
                          <span className={`text-xs px-2 py-0.5 rounded bg-white/5 text-white/60 capitalize`}>
                            {item.quality}
                          </span>
                        )}
                        <ChevronRight className="ml-auto text-white/30" size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Footer - Data Sources Legend */}
        <div className="border-t border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(dataSources).map(([key, source]) => {
              const Icon = source.icon
              return (
                <div key={key} className="flex items-center gap-2">
                  <Icon className={source.color} size={14} />
                  <span className={`text-xs ${source.color} font-medium`}>
                    {source.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* JSON Data Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-2xl border border-cyan-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl shadow-cyan-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`${selectedItem.bgColor} border-b ${selectedItem.borderColor} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <Code className={selectedItem.color} size={20} />
                  <div>
                    <h3 className="text-white font-bold">Raw Data JSON</h3>
                    <p className={`text-xs ${selectedItem.color}`}>{selectedItem.sourceName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="text-white/60" size={20} />
                </button>
              </div>

              {/* JSON Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
                <pre className="text-sm text-green-400 font-mono bg-black/40 p-4 rounded-lg border border-green-500/20 overflow-x-auto">
                  {JSON.stringify(selectedItem.rawData, null, 2)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default LiveDataFeed

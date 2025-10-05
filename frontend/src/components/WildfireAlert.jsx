/**
 * WildfireAlert Component
 *
 * Displays active wildfire alerts when fires are detected within search radius.
 * Shows fire count, closest fire distance, and detailed fire information.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, AlertTriangle, ChevronDown, ChevronUp, MapPin } from 'lucide-react'

const WildfireAlert = ({ wildfireData }) => {
  const [expanded, setExpanded] = useState(false)

  if (!wildfireData || !wildfireData.wildfire_detected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Flame className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-400">No Active Wildfires</h3>
            <p className="text-green-300/70 text-sm">
              No fires detected within {wildfireData?.search_radius_km || 100}km radius
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  const { count, closest_fire, fires, search_radius_km } = wildfireData

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'extreme':
        return 'from-red-600 to-orange-600'
      case 'high':
        return 'from-orange-500 to-red-500'
      case 'moderate':
        return 'from-yellow-500 to-orange-400'
      case 'low':
        return 'from-yellow-400 to-yellow-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'extreme':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${getSeverityColor(closest_fire?.severity)} rounded-xl p-[2px] mb-6`}
    >
      <div className="bg-gray-900 rounded-xl p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
              <Flame className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-bold text-red-400">Wildfire Alert</h3>
            </div>
            <p className="text-white/90 text-lg">
              {count} active fire{count > 1 ? 's' : ''} detected within {search_radius_km}km
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
        </div>

        {/* Closest Fire Info */}
        {closest_fire && (
          <div className="bg-white/5 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-red-400" />
              <h4 className="text-white font-semibold">Closest Fire</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-white/50">Distance from you</p>
                <p className="text-white font-semibold">{closest_fire.distance_km} km away</p>
              </div>
              <div>
                <p className="text-white/50">Severity</p>
                <span className={`inline-block px-2 py-1 rounded border text-xs font-semibold uppercase ${getSeverityBadgeColor(closest_fire.severity)}`}>
                  {closest_fire.severity}
                </span>
              </div>
              <div>
                <p className="text-white/50">Brightness</p>
                <p className="text-white font-semibold">{closest_fire.brightness}K</p>
              </div>
              <div>
                <p className="text-white/50">Confidence</p>
                <p className="text-white font-semibold">{closest_fire.confidence}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && fires && fires.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-white font-semibold mb-3">All Detected Fires</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {fires.map((fire, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="text-white font-medium">Fire #{index + 1}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs border ${getSeverityBadgeColor(fire.severity)}`}>
                          {fire.severity}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-white/50">Distance</p>
                          <p className="text-white">{fire.distance_km} km</p>
                        </div>
                        <div>
                          <p className="text-white/50">Location</p>
                          <p className="text-white">{fire.latitude.toFixed(2)}°, {fire.longitude.toFixed(2)}°</p>
                        </div>
                        <div>
                          <p className="text-white/50">Brightness</p>
                          <p className="text-white">{fire.brightness}K</p>
                        </div>
                        <div>
                          <p className="text-white/50">Detected</p>
                          <p className="text-white">{fire.acq_time ? fire.acq_time.slice(0, 2) + ':' + fire.acq_time.slice(2) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Safety Message */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4">
          <p className="text-red-300 text-sm">
            <span className="font-semibold">Safety Alert:</span> Monitor local emergency services and be prepared to evacuate if advised.
            Keep windows closed and use air purifiers indoors.
          </p>
        </div>

        {/* Data Attribution */}
        <p className="text-white/30 text-xs mt-3">
          Data from NASA FIRMS (Fire Information for Resource Management System)
        </p>
      </div>
    </motion.div>
  )
}

export default WildfireAlert

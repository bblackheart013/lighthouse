/**
 * ClearSkies v3 - Alerts Page
 *
 * The early warning system. This page displays health alerts and
 * recommendations based on air quality predictions.
 *
 * Alert system philosophy:
 * - Proactive: warn before conditions deteriorate
 * - Actionable: provide clear steps users can take
 * - Prioritized: most urgent alerts shown first
 * - Accessible: color-coded for quick scanning
 *
 * Each alert includes severity, timing, affected groups,
 * and specific action items.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, AlertCircle, Bell, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'

const Alerts = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedAlert, setExpandedAlert] = useState(null)

  const lat = import.meta.env.VITE_DEFAULT_LAT || '34.05'
  const lon = import.meta.env.VITE_DEFAULT_LON || '-118.24'

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)
        const alerts = await apiService.getAlerts(lat, lon)
        setData(alerts)
      } catch (err) {
        console.error('Alerts fetch failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [lat, lon])

  if (loading) return <LoadingSpinner message="Checking for alerts..." />

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

  // Severity configuration for visual theming
  const severityConfig = {
    high: {
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      badgeBg: 'bg-red-100'
    },
    moderate: {
      icon: AlertCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
      badgeBg: 'bg-yellow-100'
    },
    low: {
      icon: Info,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-100'
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
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Bell className="text-blue-600" size={40} />
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">
            Health Alerts
          </h1>
        </div>
        <p className="text-slate-600 text-lg">
          {data.location} • Active Alerts: {data.alerts.length}
        </p>
      </div>

      {/* Alert Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl shadow-lg p-6 mb-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {data.alerts.length > 0 ? 'Stay Informed' : 'All Clear'}
            </h2>
            <p className="opacity-90">
              {data.alerts.length > 0
                ? `${data.alerts.length} alert${data.alerts.length > 1 ? 's' : ''} for your area`
                : 'No active alerts at this time'}
            </p>
          </div>
          <Shield size={48} className="opacity-80" />
        </div>
      </motion.div>

      {/* Alerts List */}
      {data.alerts.length > 0 ? (
        <div className="space-y-4">
          {data.alerts.map((alert, index) => {
            const config = severityConfig[alert.severity.toLowerCase()] || severityConfig.low
            const Icon = config.icon
            const isExpanded = expandedAlert === alert.id

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl shadow-md overflow-hidden`}
              >
                {/* Alert Header - Always Visible */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleAlert(alert.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        <Icon className={config.iconColor} size={28} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={`text-xl font-bold ${config.textColor}`}>
                            {alert.title}
                          </h3>
                          <span className={`px-3 py-1 ${config.badgeBg} ${config.textColor} text-xs font-semibold rounded-full uppercase`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className={`${config.textColor} mb-2`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={config.textColor}>
                            <strong>Affected:</strong> {alert.affected_groups.join(', ')}
                          </span>
                          <span className={config.textColor}>
                            <strong>Time:</strong> {new Date(alert.start_time).toLocaleTimeString()} - {new Date(alert.end_time).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className={`ml-4 p-2 hover:bg-white/50 rounded-lg transition-colors ${config.textColor}`}>
                      {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Action Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t-2 border-white/50"
                    >
                      <div className="p-6 bg-white/30">
                        <h4 className={`font-bold ${config.textColor} mb-3`}>
                          Recommended Actions:
                        </h4>
                        <ul className="space-y-2">
                          {alert.actions.map((action, idx) => (
                            <li
                              key={idx}
                              className={`flex items-start space-x-3 ${config.textColor}`}
                            >
                              <span className="mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
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
          className="bg-green-50 border-2 border-green-200 rounded-xl p-12 text-center"
        >
          <Shield className="mx-auto mb-4 text-green-600" size={64} />
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            No Active Alerts
          </h2>
          <p className="text-green-600 text-lg">
            Air quality is within safe ranges for all groups.
            Continue to monitor conditions regularly.
          </p>
        </motion.div>
      )}

      {/* Alert System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-3">
          How Our Alert System Works
        </h3>
        <p className="text-slate-700 leading-relaxed mb-4">
          ClearSkies monitors air quality forecasts continuously and generates alerts when
          conditions are expected to deteriorate. Alerts are issued based on EPA guidelines
          and categorized by severity and affected population groups.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="text-red-500 mt-1" size={20} />
            <div>
              <p className="font-semibold text-slate-800">High Severity</p>
              <p className="text-sm text-slate-600">Unhealthy for everyone</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <AlertCircle className="text-yellow-500 mt-1" size={20} />
            <div>
              <p className="font-semibold text-slate-800">Moderate Severity</p>
              <p className="text-sm text-slate-600">Sensitive groups affected</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Info className="text-blue-500 mt-1" size={20} />
            <div>
              <p className="font-semibold text-slate-800">Low Severity</p>
              <p className="text-sm text-slate-600">Informational only</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Alerts

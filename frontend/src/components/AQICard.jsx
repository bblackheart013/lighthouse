/**
 * ClearSkies v3 - AQI Card Component
 *
 * This is our primary data visualization component - a card that
 * displays AQI information with appropriate color coding.
 *
 * Design decisions:
 * - Color gradients indicate air quality severity at a glance
 * - Large, readable numbers (accessibility first)
 * - Descriptive labels help users understand the data
 * - Smooth animations create a polished feel
 *
 * This component is reusable across Dashboard, Forecast, and Compare pages.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { getAQIColor, getAQIGradient, getAQICategory } from '../utils/aqi'

const AQICard = ({
  aqi,
  title = 'Air Quality Index',
  subtitle = null,
  showCategory = true,
  size = 'large',
  className = ''
}) => {
  // Round AQI to whole number for display
  const displayAQI = Math.round(aqi)
  const color = getAQIColor(aqi)
  const gradient = getAQIGradient(aqi)
  const category = getAQICategory(aqi)

  // Size variants for different use cases
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }

  const numberSizes = {
    small: 'text-4xl',
    medium: 'text-5xl',
    large: 'text-7xl'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl shadow-xl ${sizeClasses[size]} ${className}`}
      style={{ background: gradient }}
    >
      <div className="text-white">
        {/* Title */}
        <h3 className="text-sm font-medium opacity-90 mb-2">{title}</h3>

        {/* AQI Value - The hero number */}
        <div className={`font-bold ${numberSizes[size]} mb-2`}>
          {displayAQI}
        </div>

        {/* Category label */}
        {showCategory && (
          <div className="text-lg font-semibold mb-1">
            {category.label}
          </div>
        )}

        {/* Optional subtitle */}
        {subtitle && (
          <p className="text-sm opacity-90 mt-2">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

export default AQICard

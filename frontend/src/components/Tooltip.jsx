/**
 * Lighthouse v3 - Tooltip Component
 *
 * Professional tooltips that provide helpful context for metrics
 * and technical terms without cluttering the interface.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Info } from 'lucide-react'

const Tooltip = ({
  children,
  content,
  position = 'top',
  showIcon = false,
  iconType = 'info',
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false)
  let timeoutId

  const handleMouseEnter = () => {
    timeoutId = setTimeout(() => setIsVisible(true), delay)
  }

  const handleMouseLeave = () => {
    clearTimeout(timeoutId)
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
  }

  const IconComponent = iconType === 'help' ? HelpCircle : Info

  return (
    <div
      className="relative inline-flex items-center gap-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {showIcon && (
        <IconComponent className="text-gray-400 hover:text-gray-600 cursor-help" size={16} />
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            {/* Tooltip Box */}
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl max-w-xs whitespace-normal">
              {content}

              {/* Arrow */}
              <div
                className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Specialized tooltip for metric explanations
export const MetricTooltip = ({ label, explanation, value, unit }) => (
  <Tooltip
    content={
      <div>
        <div className="font-semibold mb-1">{label}</div>
        <div className="text-gray-300 text-xs">{explanation}</div>
        {value && (
          <div className="mt-2 text-gray-400 text-xs">
            Current: {value}{unit}
          </div>
        )}
      </div>
    }
    position="top"
    showIcon
    iconType="help"
  >
    <span className="cursor-help border-b border-dotted border-gray-400">
      {label}
    </span>
  </Tooltip>
)

export default Tooltip

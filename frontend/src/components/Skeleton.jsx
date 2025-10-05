/**
 * ClearSkies v3 - Skeleton Loading Component
 *
 * Professional loading states that maintain layout and reduce perceived wait time.
 * Much better UX than spinning loaders - users see the structure before the data.
 */

import React from 'react'
import { motion } from 'framer-motion'

export const Skeleton = ({ className = '', variant = 'default' }) => {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded'

  return (
    <div className={`${baseClasses} ${className}`} />
  )
}

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-500 to-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Location */}
          <Skeleton className="h-8 w-64 mx-auto mb-4" />

          {/* Giant AQI Number */}
          <Skeleton className="h-48 w-80 mx-auto mb-4" />

          {/* Category */}
          <Skeleton className="h-10 w-96 mx-auto mb-6" />

          {/* Health Recommendation */}
          <Skeleton className="h-6 w-[600px] mx-auto" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
      </div>

      {/* Details Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-8 w-24" />
            </motion.div>
          ))}
        </div>

        {/* Health Guidance Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-8"
        >
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </motion.div>

        {/* Environmental Metrics Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
        >
          <Skeleton className="h-7 w-56 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-500/10 rounded-lg p-4 border border-white/10">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export const CompareSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <Skeleton className="h-12 w-96 mx-auto mb-2" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>

      {/* Trend Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-8 h-8 rounded" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-12 w-24 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-32 w-full mb-4 rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <Skeleton className="h-7 w-48 mb-6" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </motion.div>
  )
}

export default Skeleton

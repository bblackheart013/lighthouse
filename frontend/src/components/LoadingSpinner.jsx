/**
 * ClearSkies v3 - Loading Spinner Component
 *
 * Waiting doesn't have to be boring. This spinner provides visual
 * feedback during data fetches, maintaining user engagement and
 * reducing perceived wait times.
 *
 * The gradient animation gives it a modern, NASA-tech feel.
 */

import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ message = 'Loading data from satellites...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      {/* Animated spinner with gradient */}
      <div className="relative">
        <Loader2
          size={48}
          className="animate-spin text-blue-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-20 blur-xl rounded-full"></div>
      </div>

      {/* Loading message */}
      <p className="text-slate-600 font-medium animate-pulse">
        {message}
      </p>

      {/* Subtle dots animation */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  )
}

export default LoadingSpinner

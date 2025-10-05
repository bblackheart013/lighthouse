/**
 * ClearSkies v3 - Error Boundary Component
 *
 * Professional error handling that catches React component errors
 * and displays a beautiful, helpful error screen instead of a blank page.
 */

import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { motion } from 'framer-motion'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // Log to error tracking service (e.g., Sentry) in production
    if (import.meta.env.PROD) {
      // window.Sentry?.captureException(error)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            {/* Error Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
                  <div className="relative bg-red-500/10 p-6 rounded-full border border-red-500/20">
                    <AlertCircle className="text-red-400" size={64} />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
                Something Went Wrong
              </h1>

              {/* Description */}
              <p className="text-white/70 text-center text-lg mb-8">
                We encountered an unexpected error. Don't worry, our team has been notified
                and we're working on it. Try refreshing the page or returning home.
              </p>

              {/* Error Details (Dev Mode) */}
              {!import.meta.env.PROD && this.state.error && (
                <div className="mb-8 bg-black/30 rounded-xl p-4 border border-red-500/20">
                  <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Error Details (Development Only)
                  </h3>
                  <pre className="text-xs text-white/60 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo && (
                      <>
                        {'\n\n'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                  <RefreshCw size={20} />
                  Reload Page
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20"
                >
                  <Home size={20} />
                  Go Home
                </motion.button>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-white/50 text-sm">
                  Need help? Contact support at{' '}
                  <a href="mailto:support@clearskies.app" className="text-blue-400 hover:text-blue-300 underline">
                    support@clearskies.app
                  </a>
                </p>
              </div>
            </div>

            {/* Attribution */}
            <div className="mt-6 text-center">
              <p className="text-white/30 text-sm">
                ClearSkies v3 - Powered by NASA TEMPO, OpenAQ, and NOAA
              </p>
            </div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

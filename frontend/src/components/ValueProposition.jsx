/**
 * ClearSkies Value Proposition Component
 * Compelling hero section explaining WHY users need this app
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
  Satellite,
  Brain,
  Globe,
  MapPin,
  Calendar,
  Shield,
  Wind,
  Flame,
  Activity,
  CheckCircle,
  Database,
  TrendingUp,
  Eye
} from 'lucide-react'

const ValueProposition = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Hero Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Main Headline */}
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-lg rounded-full border border-blue-400/30 mb-6">
            <Satellite className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-blue-300 text-sm font-semibold">Real-time air quality from NASA satellites</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Why ClearSkies?
          </h1>

          <p className="text-2xl md:text-3xl font-light text-white/90 mb-4">
            Air quality that actually matters
          </p>

          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            NASA's TEMPO satellite data meets AI. Get hyper-local air quality
            insights and know exactly when it's safe to go outside.
          </p>
        </motion.div>

        {/* Key Differentiators Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          variants={containerVariants}
        >
          <motion.div
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center mb-4">
              <Satellite className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">NASA TEMPO Data</h3>
            <p className="text-white/70 text-sm">
              Direct satellite measurements from space, updated every hour
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-105"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Health Insights</h3>
            <p className="text-white/70 text-sm">
              Google Gemini analyzes your air quality and gives you personalized health tips
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Coverage</h3>
            <p className="text-white/70 text-sm">
              Track air quality anywhere in the world with comprehensive satellite and ground sensor data
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-400/30 hover:border-orange-400/60 transition-all duration-300 hover:scale-105"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 bg-orange-500/30 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">±1km Accuracy</h3>
            <p className="text-white/70 text-sm">
              Your exact neighborhood, not just city-wide estimates
            </p>
          </motion.div>
        </motion.div>

        {/* Three Value Pillars */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
        >
          {/* Pillar 1: Know Before You Go */}
          <motion.div
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-lg rounded-3xl p-8 border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Know Before You Go</h2>
            </div>

            <p className="text-white/80 text-lg mb-6">
              Real-time + 24-hour forecasts so you can plan your day
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">Live updates every 60 seconds with countdown timer</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">24-hour predictive forecasts using linear regression</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">Best time recommendations for outdoor exercise</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">Umbrella alerts for rain predictions</span>
              </li>
            </ul>
          </motion.div>

          {/* Pillar 2: Breathe Smarter */}
          <motion.div
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-3xl p-8 border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Breathe Smarter</h2>
            </div>

            <p className="text-white/80 text-lg mb-6">
              Personalized mask recommendations and breath scores for your location
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">AI-calculated "Breath Score" (0-100 scale)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">Smart mask recommendations: N95, surgical, or none</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">Personalized health guidance for sensitive groups</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">PM2.5, PM10, NO2, O3, CO, SO2 tracking</span>
              </li>
            </ul>
          </motion.div>

          {/* Pillar 3: Stay Protected */}
          <motion.div
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-lg rounded-3xl p-8 border border-orange-400/20 hover:border-orange-400/50 transition-all duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Stay Protected</h2>
            </div>

            <p className="text-white/80 text-lg mb-6">
              Wildfire alerts with exact coordinates and AI health guidance
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">Real-time wildfire detection within 100km radius</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">Exact GPS coordinates and distance to fire</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">Fire brightness and confidence ratings</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                <span className="text-white/70">AI-powered evacuation and safety recommendations</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Data Transparency Section */}
        <motion.div
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-3xl p-10 border border-gray-700/50"
          variants={itemVariants}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-lg rounded-full border border-green-400/30 mb-4">
              <Eye className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm font-semibold">100% Transparent Data</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              Every metric you see is real-time and validated. No fake numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Data Sources */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Data Sources</h3>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-center justify-center gap-2">
                  <Satellite className="w-4 h-4 text-blue-400" />
                  <span>NASA TEMPO Satellite (NO₂ measurements)</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span>OpenAQ Ground Sensors (PM2.5, PM10, etc.)</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Google Gemini AI (Health insights)</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>NASA FIRMS (Wildfire detection)</span>
                </li>
              </ul>
            </div>

            {/* Calculation Methods */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Calculation Methods</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>Linear regression forecasting with R² validation</li>
                <li>Multi-source data fusion (satellite + ground)</li>
                <li>EPA AQI standard conversion formulas</li>
                <li>Weighted averaging for confidence scoring</li>
                <li>Real-time interpolation for missing data</li>
              </ul>
            </div>

            {/* Validation */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Source Validation</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>Cross-reference satellite with ground sensors</li>
                <li>Flag low-confidence predictions</li>
                <li>Historical trend analysis for accuracy</li>
                <li>Weather-adjusted AQI calculations</li>
                <li>Continuous model improvement</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center mt-16"
          variants={itemVariants}
        >
          <p className="text-white/60 text-sm">
            Powered by space tech and AI
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ValueProposition

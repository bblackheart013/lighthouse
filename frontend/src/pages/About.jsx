/**
 * Lighthouse v3 - About Page
 *
 * The mission briefing. This page tells the story of Lighthouse:
 * our purpose, our approach, and our commitment to communities
 * affected by air pollution.
 *
 * Built for NASA Space Apps Challenge 2025, Lighthouse represents
 * the future of accessible, actionable environmental data.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Satellite, Database, Cloud, Target, Users, Zap, Globe, Heart, Award, Flame, Sparkles, Server } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Satellite,
      title: 'NASA TEMPO Satellite',
      description: 'Hourly air quality measurements from space, providing unprecedented temporal resolution for North America.',
      color: 'blue'
    },
    {
      icon: Flame,
      title: 'NASA FIRMS Wildfire Data',
      description: 'Real-time wildfire detection with exact GPS coordinates, helping you stay safe during fire season.',
      color: 'orange'
    },
    {
      icon: Sparkles,
      title: 'Google Gemini AI',
      description: 'AI-powered health insights that analyze air quality and provide personalized recommendations for your safety.',
      color: 'purple'
    },
    {
      icon: Database,
      title: 'OpenAQ Ground Data',
      description: 'Validated ground station measurements for accuracy and real-world calibration of satellite data.',
      color: 'green'
    },
    {
      icon: Cloud,
      title: 'NOAA Weather Integration',
      description: 'Meteorological data to understand how weather patterns influence air quality and pollution dispersion.',
      color: 'cyan'
    },
    {
      icon: Zap,
      title: 'Machine Learning Forecasts',
      description: 'Advanced ML models predict air quality 24 hours ahead with high confidence and accuracy.',
      color: 'yellow'
    }
  ]

  const mission = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Democratize access to accurate air quality information, empowering communities to make informed health decisions.'
    },
    {
      icon: Users,
      title: 'Who We Serve',
      description: 'From parents planning outdoor activities to policymakers crafting environmental regulations, Lighthouse serves everyone.'
    },
    {
      icon: Heart,
      title: 'Why It Matters',
      description: 'Air pollution causes 7 million premature deaths annually. Better information leads to better outcomes.'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Hero Section */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-xl mb-4">
            <Globe className="text-white" size={64} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl sm:text-6xl font-bold text-slate-800 mb-6"
        >
          About Lighthouse
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl text-slate-600 italic max-w-3xl mx-auto"
        >
          "The future of air isn't just predicted — it's understood."
        </motion.p>
      </div>

      {/* What Makes Lighthouse Different */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
          What Makes Lighthouse Different
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mb-4">
              <Satellite className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Real NASA Satellite Data</h3>
            <p className="text-slate-600 leading-relaxed">
              Hourly updates from the TEMPO satellite, not city-wide estimates. Your exact neighborhood, down to ±1km accuracy.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center mb-4">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">AI Health Guidance</h3>
            <p className="text-slate-600 leading-relaxed">
              Google Gemini analyzes air quality and gives you personalized advice. Know when to wear a mask, when it's safe to exercise outside.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-400 rounded-xl flex items-center justify-center mb-4">
              <Globe className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">24-Hour Forecasts</h3>
            <p className="text-slate-600 leading-relaxed">
              Plan your day with predictive forecasts. Plus wildfire alerts with exact GPS coordinates when fires are nearby.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {mission.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">
          Powered by World-Class Data
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const colorClasses = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              purple: 'from-purple-500 to-purple-600',
              yellow: 'from-yellow-500 to-yellow-600',
              orange: 'from-orange-500 to-orange-600',
              cyan: 'from-cyan-500 to-cyan-600'
            }

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 bg-gradient-to-br ${colorClasses[feature.color]} rounded-lg flex-shrink-0`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* The Story */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-12 text-white mb-16"
      >
        <h2 className="text-3xl font-bold mb-6">The Story Behind Lighthouse</h2>
        <div className="space-y-4 text-lg leading-relaxed opacity-90">
          <p>
            Lighthouse was born from a simple question: <strong>What if everyone could see
            the air they breathe?</strong>
          </p>
          <p>
            Air pollution is invisible, but its impacts are profound. Communities near
            highways, industrial zones, and wildfire-prone areas face daily health risks
            that are often poorly understood and inadequately communicated.
          </p>
          <p>
            With NASA's revolutionary TEMPO satellite providing hourly air quality snapshots
            across North America, we saw an opportunity. By combining satellite data with
            ground measurements and weather patterns, we could create something unprecedented:
            <strong> predictive air quality intelligence for everyone</strong>.
          </p>
          <p>
            Built for the NASA Space Apps Challenge 2025, Lighthouse represents our vision
            of a future where environmental data isn't locked in academic papers or government
            databases — it's in your pocket, helping you protect yourself and your loved ones.
          </p>
        </div>
      </motion.div>

      {/* NASA Space Apps Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.7 }}
        className="bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <Award className="mx-auto mb-4 text-blue-600" size={48} />
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          NASA Space Apps Challenge 2025
        </h3>
        <p className="text-slate-600 mb-4">
          Lighthouse v3 is our submission to the world's largest global hackathon,
          addressing the challenge of making NASA's Earth observation data accessible
          and actionable for communities worldwide.
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-slate-600">
          <div>
            <p className="font-semibold text-slate-800">Data Sources</p>
            <p>NASA, NOAA, OpenAQ</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Technology</p>
            <p>React, Python, ML</p>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Impact</p>
            <p>Global Health</p>
          </div>
        </div>
      </motion.div>

      {/* Powered By & Partners Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9 }}
        className="mt-16 mb-16"
      >
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">
          Powered By & Partners
        </h2>
        <p className="text-center text-slate-600 mb-12 max-w-3xl mx-auto">
          Lighthouse is built on cutting-edge technology from world-class organizations committed to making Earth observation data accessible and actionable.
        </p>

        {/* Partner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* NASA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-blue-200"
          >
            <div className="flex items-center justify-center mb-4">
              <Satellite className="text-blue-600" size={48} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">NASA</h3>
            <p className="text-center text-slate-600 text-sm">
              TEMPO Satellite & FIRMS Wildfire Data
            </p>
          </motion.div>

          {/* Google Gemini */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.1 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-purple-200"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="text-purple-600" size={48} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Google Gemini</h3>
            <p className="text-center text-slate-600 text-sm">
              AI-Powered Health Insights & Recommendations
            </p>
          </motion.div>

          {/* Cloudflare */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.2 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-orange-200"
          >
            <div className="flex items-center justify-center mb-4">
              <Server className="text-orange-600" size={48} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Cloudflare</h3>
            <p className="text-center text-slate-600 text-sm">
              Global Edge Network & Platform Infrastructure
            </p>
          </motion.div>
        </div>

        {/* Additional Data Sources */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3 }}
            className="bg-white rounded-lg p-4 shadow-md text-center border border-slate-200"
          >
            <Cloud className="mx-auto mb-2 text-slate-600" size={32} />
            <p className="text-sm font-semibold text-slate-800">NOAA</p>
            <p className="text-xs text-slate-600">Weather Data</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4 }}
            className="bg-white rounded-lg p-4 shadow-md text-center border border-slate-200"
          >
            <Database className="mx-auto mb-2 text-slate-600" size={32} />
            <p className="text-sm font-semibold text-slate-800">OpenAQ</p>
            <p className="text-xs text-slate-600">Ground Sensors</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
            className="bg-white rounded-lg p-4 shadow-md text-center border border-slate-200"
          >
            <Zap className="mx-auto mb-2 text-slate-600" size={32} />
            <p className="text-sm font-semibold text-slate-800">Scikit-learn</p>
            <p className="text-xs text-slate-600">ML Forecasts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6 }}
            className="bg-white rounded-lg p-4 shadow-md text-center border border-slate-200"
          >
            <Award className="mx-auto mb-2 text-slate-600" size={32} />
            <p className="text-sm font-semibold text-slate-800">NASA Space Apps</p>
            <p className="text-xs text-slate-600">2025 Challenge</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.7 }}
        className="mt-16 text-center"
      >
        <p className="text-slate-600 text-lg mb-4">
          Ready to explore your air quality?
        </p>
        <a
          href="/"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          View Dashboard
        </a>
      </motion.div>
    </motion.div>
  )
}

export default About

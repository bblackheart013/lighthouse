/**
 * ClearSkies v3 - About Page
 *
 * The mission briefing. This page tells the story of ClearSkies:
 * our purpose, our approach, and our commitment to communities
 * affected by air pollution.
 *
 * Built for NASA Space Apps Challenge 2025, ClearSkies represents
 * the future of accessible, actionable environmental data.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Satellite, Database, Cloud, Target, Users, Zap, Globe, Heart, Award } from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Satellite,
      title: 'NASA TEMPO Satellite',
      description: 'Hourly air quality measurements from space, providing unprecedented temporal resolution for North America.',
      color: 'blue'
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
      color: 'purple'
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
      description: 'From parents planning outdoor activities to policymakers crafting environmental regulations, ClearSkies serves everyone.'
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
          About ClearSkies
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

      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {mission.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
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
        transition={{ delay: 0.8 }}
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
              yellow: 'from-yellow-500 to-yellow-600'
            }

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
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
        transition={{ delay: 1.2 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-12 text-white mb-16"
      >
        <h2 className="text-3xl font-bold mb-6">The Story Behind ClearSkies</h2>
        <div className="space-y-4 text-lg leading-relaxed opacity-90">
          <p>
            ClearSkies was born from a simple question: <strong>What if everyone could see
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
            Built for the NASA Space Apps Challenge 2025, ClearSkies represents our vision
            of a future where environmental data isn't locked in academic papers or government
            databases — it's in your pocket, helping you protect yourself and your loved ones.
          </p>
        </div>
      </motion.div>

      {/* NASA Space Apps Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4 }}
        className="bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <Award className="mx-auto mb-4 text-blue-600" size={48} />
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          NASA Space Apps Challenge 2025
        </h3>
        <p className="text-slate-600 mb-4">
          ClearSkies v3 is our submission to the world's largest global hackathon,
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

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
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

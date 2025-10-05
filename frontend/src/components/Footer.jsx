/**
 * Lighthouse v3 - Footer Component
 *
 * Every great mission needs proper attribution. This footer honors
 * the incredible work of NASA TEMPO, OpenAQ, and NOAA - the data
 * providers that make Lighthouse possible.
 *
 * It's minimal, elegant, and informative - just like a good
 * mission patch.
 */

import React from 'react'
import { Satellite, Database, Cloud } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tagline - The mission statement */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-slate-700 italic">
            "The future of air isn't just predicted — it's understood."
          </p>
        </div>

        {/* Data sources - Attribution where it's due */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-slate-600">
            <Satellite size={20} className="text-blue-500" />
            <span className="text-sm">NASA TEMPO Satellite</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-600">
            <Database size={20} className="text-green-500" />
            <span className="text-sm">OpenAQ Ground Data</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-600">
            <Cloud size={20} className="text-purple-500" />
            <span className="text-sm">NOAA Weather</span>
          </div>
        </div>

        {/* Copyright and NASA Space Apps */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-600">
            Built for{' '}
            <span className="font-semibold text-blue-600">
              NASA Space Apps Challenge 2025
            </span>
          </p>
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Lighthouse v3. Empowering communities through data.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

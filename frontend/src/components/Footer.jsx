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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tagline - The mission statement */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-sm sm:text-base md:text-lg font-medium text-slate-700 italic px-2">
            "The future of air isn't just predicted — it's understood."
          </p>
        </div>

        {/* Data sources - Attribution where it's due */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Satellite size={18} className="text-blue-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm">NASA TEMPO Satellite</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Database size={18} className="text-green-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm">OpenAQ Ground Data</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Cloud size={18} className="text-purple-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm">NOAA Weather</span>
          </div>
        </div>

        {/* Copyright and NASA Space Apps */}
        <div className="text-center space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-slate-600 px-2">
            Built for{' '}
            <span className="font-semibold text-blue-600">
              NASA Space Apps Challenge 2025
            </span>
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 px-2">
            &copy; {currentYear} Lighthouse v3. Empowering communities through data.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

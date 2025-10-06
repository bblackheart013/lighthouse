/**
 * Lighthouse - Navigation Bar Component
 *
 * The navigation bar is our mission control panel - always visible,
 * always accessible. It uses React Router's NavLink to provide
 * visual feedback on the current page, helping users maintain
 * situational awareness.
 *
 * Design philosophy: Clean, minimal, Apple-inspired.
 * Every element has purpose, nothing is decoration.
 */

import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import LocationSelector from './LocationSelector'
import { useLocation } from '../context/LocationContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { location, setLocation } = useLocation()

  // Navigation links configuration
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/forecast', label: 'Forecast' },
    { path: '/history', label: 'History' },
    { path: '/compare', label: 'Compare' },
    { path: '/alerts', label: 'Alerts' },
    { path: '/about', label: 'About' },
  ]

  // Shared styles for NavLink - active state gets blue accent
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-slate-700 hover:bg-white hover:shadow-md'
    }`

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            {/* Modern minimal logo - Air quality waves icon */}
            <div className="relative w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:shadow-slate-900/40 transition-all duration-300 group-hover:scale-105 overflow-hidden">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Air quality waves icon - minimal and modern */}
              <svg className="relative z-10 w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Three curved lines representing air waves/quality levels */}
                <path d="M3 12h4" className="opacity-60" />
                <path d="M3 6h7" />
                <path d="M3 18h7" className="opacity-60" />
                <path d="M13 6c3 0 5.5 2.5 5.5 5.5S16 17 13 17" className="opacity-80" />
                <path d="M13 9.5c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5" />

                {/* Optional: Small monitoring dot */}
                <circle cx="19.5" cy="11.5" r="1.5" fill="currentColor" className="opacity-90">
                  <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700"></div>
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-violet-700 transition-colors duration-300">
                Lighthouse
              </span>
              <span className="text-[10px] text-slate-500 font-semibold -mt-1 tracking-[0.2em] uppercase">Air Quality Intel</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
            <LocationSelector
              onLocationChange={setLocation}
              currentLocation={location}
            />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-slate-200">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={linkClass}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2">
              <LocationSelector
                onLocationChange={setLocation}
                currentLocation={location}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

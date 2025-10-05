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
            <div className="relative w-11 h-11 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                Lighthouse
              </span>
              <span className="text-[10px] text-slate-500 font-medium -mt-1 tracking-wider">AIR QUALITY INTELLIGENCE</span>
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
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
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

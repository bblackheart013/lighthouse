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
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🏮</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Lighthouse
            </span>
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

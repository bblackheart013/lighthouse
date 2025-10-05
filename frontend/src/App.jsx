/**
 * ClearSkies v3 - Main Application Component
 *
 * This is the architectural backbone of our application. Like a flight plan,
 * it defines all possible routes and ensures users can navigate between
 * different views seamlessly.
 *
 * The layout wraps all pages with our persistent Navbar and Footer,
 * creating a consistent experience across the entire application.
 */

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { LocationProvider } from './context/LocationContext'
import Navbar from './components/Navbar'
import DataDisclaimer from './components/DataDisclaimer'
import Footer from './components/Footer'
import DataSourcesFooter from './components/DataSourcesFooter'
import Dashboard from './pages/Dashboard'
import Forecast from './pages/Forecast'
import History from './pages/History'
import Compare from './pages/Compare'
import Alerts from './pages/Alerts'
import About from './pages/About'
import MultiCityCompare from './pages/MultiCityCompare'

function App() {
  return (
    <LocationProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <DataDisclaimer />

        {/* Main content area - grows to fill available space */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/history" element={<History />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/multi-compare" element={<MultiCityCompare />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <DataSourcesFooter />
        <Footer />
      </div>
    </LocationProvider>
  )
}

export default App

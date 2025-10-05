/**
 * Lighthouse v3 - Data Export Component
 *
 * Professional data export features:
 * - PDF report generation with branding
 * - JSON data export for developers
 * - Shareable link generation
 * - Print-friendly view
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share2, FileJson, Printer, Link2, Check, X } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getAQILabel, getAQIColor } from '../utils/aqi'

const DataExport = ({ data, location }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [shareStatus, setShareStatus] = useState(null) // 'success', 'error', null

  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Header with branding
      pdf.setFillColor(59, 130, 246) // Blue
      pdf.rect(0, 0, pageWidth, 40, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont(undefined, 'bold')
      pdf.text('Lighthouse Air Quality Report', 15, 20)

      pdf.setFontSize(12)
      pdf.setFont(undefined, 'normal')
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 30)

      // Location Info
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(16)
      pdf.setFont(undefined, 'bold')
      pdf.text(`Location: ${location?.city || `${location?.lat}, ${location?.lon}`}`, 15, 55)

      // AQI Display
      const aqi = data?.prediction?.aqi || data?.air_quality_index || 0
      const aqiLabel = getAQILabel(aqi)

      pdf.setFontSize(48)
      pdf.setFont(undefined, 'bold')
      const aqiColor = getAQIColor(aqi)
      const rgb = hexToRgb(aqiColor)
      pdf.setTextColor(rgb.r, rgb.g, rgb.b)
      pdf.text(`AQI: ${aqi}`, 15, 80)

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(18)
      pdf.text(`Status: ${aqiLabel}`, 15, 95)

      // Health Guidance
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text('Health Guidance:', 15, 110)

      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(11)
      const guidance = data?.health_guidance?.general_public || 'No guidance available'
      const splitGuidance = pdf.splitTextToSize(guidance, pageWidth - 30)
      pdf.text(splitGuidance, 15, 120)

      // Data Sources
      let yPos = 140
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text('Data Sources:', 15, yPos)

      yPos += 10
      pdf.setFontSize(11)
      pdf.setFont(undefined, 'normal')

      if (data?.data_sources) {
        if (data.data_sources.satellite?.available) {
          pdf.text('- NASA TEMPO Satellite: Active', 15, yPos)
          yPos += 6
        }
        if (data.data_sources.ground_sensors?.available) {
          pdf.text('- Ground Sensors: Active', 15, yPos)
          yPos += 6
        }
        if (data.data_sources.weather?.available) {
          pdf.text(`- Weather: ${data.data_sources.weather.conditions}`, 15, yPos)
          yPos += 6
        }
      }

      // Footer
      pdf.setTextColor(128, 128, 128)
      pdf.setFontSize(9)
      pdf.text('Powered by NASA TEMPO, OpenAQ, and NOAA', 15, pageHeight - 15)
      pdf.text('Lighthouse v3 - Real-time Earth Awareness', 15, pageHeight - 10)

      // Save
      pdf.save(`lighthouse-report-${location?.city || 'location'}-${new Date().toISOString().split('T')[0]}.pdf`)
      setShowMenu(false)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const handleExportJSON = () => {
    try {
      const exportData = {
        location: location,
        timestamp: new Date().toISOString(),
        prediction: data?.prediction,
        health_guidance: data?.health_guidance,
        data_sources: data?.data_sources,
        exported_by: 'Lighthouse v3',
        version: '3.0.0'
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `lighthouse-data-${location?.city || 'location'}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      setShowMenu(false)
    } catch (error) {
      console.error('JSON export failed:', error)
      alert('Failed to export JSON. Please try again.')
    }
  }

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?lat=${location?.lat}&lon=${location?.lon}${location?.city ? `&city=${encodeURIComponent(location.city)}` : ''}`

      if (navigator.share) {
        await navigator.share({
          title: `Air Quality in ${location?.city || 'Location'}`,
          text: `Current AQI: ${data?.prediction?.aqi || data?.air_quality_index || 'N/A'}`,
          url: shareUrl
        })
        setShareStatus('success')
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        setShareStatus('success')
      }

      setTimeout(() => {
        setShareStatus(null)
        setShowMenu(false)
      }, 2000)
    } catch (error) {
      console.error('Share failed:', error)
      setShareStatus('error')
      setTimeout(() => setShareStatus(null), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
    setShowMenu(false)
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  return (
    <div className="relative">
      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-lg border border-white/20 text-white transition-all"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Export & Share</span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
            >
              {/* PDF Export */}
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
              >
                <Download className="text-blue-600" size={20} />
                <div>
                  <div className="font-semibold text-gray-800">Export PDF</div>
                  <div className="text-xs text-gray-500">Download report</div>
                </div>
              </button>

              {/* JSON Export */}
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
              >
                <FileJson className="text-green-600" size={20} />
                <div>
                  <div className="font-semibold text-gray-800">Export JSON</div>
                  <div className="text-xs text-gray-500">Raw data</div>
                </div>
              </button>

              {/* Share Link */}
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
              >
                {shareStatus === 'success' ? (
                  <Check className="text-green-600" size={20} />
                ) : shareStatus === 'error' ? (
                  <X className="text-red-600" size={20} />
                ) : (
                  <Share2 className="text-purple-600" size={20} />
                )}
                <div>
                  <div className="font-semibold text-gray-800">
                    {shareStatus === 'success' ? 'Link Copied!' : shareStatus === 'error' ? 'Failed' : 'Share Link'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {shareStatus === 'success' ? 'Ready to paste' : 'Generate shareable URL'}
                  </div>
                </div>
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Printer className="text-gray-600" size={20} />
                <div>
                  <div className="font-semibold text-gray-800">Print</div>
                  <div className="text-xs text-gray-500">Print-friendly view</div>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DataExport

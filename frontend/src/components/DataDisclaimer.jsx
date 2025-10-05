/**
 * Data Disclaimer Banner
 * Explains data sources and government shutdown impact
 */

import React, { useState } from 'react'
import { Info, X, Satellite, CheckCircle2, AlertCircle } from 'lucide-react'

const DataDisclaimer = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div className="w-full bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 text-white shadow-lg border-b-2 border-blue-400">
      <div className="max-w-7xl mx-auto px-6 py-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-700/50 rounded-lg">
              <Info className="text-blue-200" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Satellite size={16} className="text-blue-300" />
                NASA TEMPO Data Status
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Using archived satellite data (Sept 2024) + real-time ground sensors (WAQI)
                {!isExpanded && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="ml-2 text-blue-300 hover:text-white underline"
                  >
                    Learn more →
                  </button>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 hover:bg-blue-700/50 rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pb-2 space-y-3 border-t border-blue-700 pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Real-Time Data */}
              <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/30">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="text-green-400 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-sm text-green-100 mb-1">
                      ✅ Real-Time Ground Sensors (WAQI)
                    </h4>
                    <ul className="text-xs text-green-200 space-y-1">
                      <li>• 13,000+ EPA-certified monitoring stations worldwide</li>
                      <li>• Live AQI updates (same data as Apple Weather, Google)</li>
                      <li>• <strong>Currently Active</strong> - not affected by shutdown</li>
                      <li>• Global coverage including Delhi, NYC, Tokyo, London, etc.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Satellite Data */}
              <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-600/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-amber-400 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-sm text-amber-100 mb-1">
                      🛰️ NASA TEMPO Satellite Data
                    </h4>
                    <ul className="text-xs text-amber-200 space-y-1">
                      <li>• Authentic NASA NO₂ measurements from space</li>
                      <li>• <strong>Archived data:</strong> September 2024 (most recent available)</li>
                      <li>• Real-time processing paused due to U.S. government shutdown</li>
                      <li>• Will resume when NASA operations restart</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Authenticity Statement */}
            <div className="bg-blue-800/40 rounded-lg p-3 border border-blue-500/40">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="text-blue-300" size={16} />
                100% Real Data - No Synthetic or Simulated Values
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                All air quality data displayed in ClearSkies comes from <strong>authentic scientific sources</strong>:
                NASA's TEMPO satellite mission (archived NetCDF data from official NASA repositories),
                WAQI's global network of government-certified monitoring stations, and
                Open-Meteo's aggregation of NOAA/ECMWF weather data.
                We use <strong>zero hardcoded, synthetic, or simulated data</strong>.
              </p>
            </div>

            {/* Collapse Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-blue-300 hover:text-white underline"
              >
                Show less
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataDisclaimer

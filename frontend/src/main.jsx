/**
 * Lighthouse v3 - Main Entry Point (PRODUCTION READY)
 *
 * This is where our React application bootstraps itself into the DOM.
 * We wrap everything in:
 * - ErrorBoundary for production-grade error handling
 * - BrowserRouter to enable client-side routing
 *
 * Think of this as mission control - everything launches from here.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)

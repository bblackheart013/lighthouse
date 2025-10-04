/**
 * ClearSkies v3 - Main Entry Point
 *
 * This is where our React application bootstraps itself into the DOM.
 * We wrap everything in BrowserRouter to enable client-side routing,
 * allowing seamless navigation without page reloads - crucial for
 * a responsive, app-like experience.
 *
 * Think of this as mission control - everything launches from here.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

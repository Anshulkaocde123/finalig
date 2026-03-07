import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './mobile-optimizations.css'
// Restored original App
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { initPerformanceMonitoring } from './utils/performance'
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

//set status bar as opaque on mobile for better contrast with app content
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Light });
  StatusBar.setOverlaysWebView({ overlay: false });
}

// Enable performance monitoring in production
if (import.meta.env.PROD) {
  initPerformanceMonitoring();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <div className="min-h-screen pt-safe-top pb-safe-bottom">
        <App />
      </div>
    </ErrorBoundary>
  </StrictMode>,
)

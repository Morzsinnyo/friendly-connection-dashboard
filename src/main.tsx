
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Explicitly expose React to window for debugging
// @ts-ignore - Explicitly setting React to window for debug purposes
window.React = React;

// Global error handler to catch unhandled exceptions
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error || event.message)
  
  // Don't show error UI if it's just a script loading error for external resources
  if (event.filename && !event.filename.includes(window.location.origin)) {
    console.warn('External script error, not interrupting app:', event.filename)
    return
  }
  
  const rootEl = document.getElementById('root')
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 20px; font-family: system-ui, sans-serif; line-height: 1.5;">
        <h2 style="color: #e11d48;">Unhandled Application Error</h2>
        <p>We're sorry, the application encountered a fatal error. Please refresh the page.</p>
        <p style="font-size: 0.8rem; color: #64748b;">Technical details: ${event.message}</p>
        <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `
  }
})

// Store React version on window for debugging
if (React && React.version) {
  console.log('React version detected:', React.version)
}

// Function to initialize the React application
function initializeReact() {
  console.log('Starting React initialization at', new Date().toISOString())
  
  // Detect if we're in an iframe, which might cause issues
  if (window.top !== window.self) {
    console.warn('Application running in an iframe - this may cause issues with certain features')
  }
  
  try {
    const rootElement = document.getElementById('root')
    
    if (!rootElement) {
      throw new Error('Failed to find the root element with id "root"')
    }
    
    // Check if root already has content (might indicate double initialization)
    if (rootElement.hasChildNodes() && rootElement.innerHTML.trim() !== '') {
      console.warn('Root element already has content - possible double initialization. Clearing.')
      rootElement.innerHTML = ''
    }
    
    console.log('Creating React root...')
    const root = createRoot(rootElement)
    
    // Debug: Show what we're about to render
    console.log('Rendering App component...')
    
    // Add a timestamp to help with HMR debugging
    // @ts-ignore - Adding debugging metadata to window
    window.__REACT_INIT_TIME = Date.now()
    
    // Render the application
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    
    console.log('App rendered successfully at', new Date().toISOString())
    
    // Add a signal to the window that React has initialized successfully
    // @ts-ignore - Adding debugging metadata to window
    window.__REACT_INITIALIZED = true
  } catch (error) {
    console.error('Fatal error during React initialization:', error)
    
    // Display a user-friendly error message in the DOM
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: system-ui, sans-serif; line-height: 1.5;">
          <h2 style="color: #e11d48;">Application Error</h2>
          <p>The application failed to initialize. Technical details below:</p>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 4px; margin: 12px 0; font-family: monospace; white-space: pre-wrap;">
            ${error instanceof Error ? `${error.name}: ${error.message}\n${error.stack || ''}` : String(error)}
          </div>
          <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Try Again
          </button>
        </div>
      `
    }
    
    // Re-throw to ensure the error is logged
    throw error
  }
}

// Ensure DOM is fully loaded before initializing React
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReact)
} else {
  // DOM already loaded, initialize immediately
  initializeReact()
}

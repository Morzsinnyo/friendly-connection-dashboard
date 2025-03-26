
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Wrapped in an IIFE to handle any initialization errors
(function() {
  try {
    // Create root element and render the app
    const rootElement = document.getElementById('root')

    if (!rootElement) {
      throw new Error('Failed to find the root element')
    }

    const root = createRoot(rootElement)
    
    // Add console log to confirm we're reaching this point
    console.log('React root created, attempting to render App')
    
    // Render the App wrapped in an error boundary to catch render errors
    root.render(
      <App />
    )
    
    console.log('App successfully rendered')
  } catch (error) {
    console.error('Fatal error during React initialization:', error)
    
    // Display a user-friendly error message in the DOM
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.5;">
          <h2 style="color: #e11d48;">Application Error</h2>
          <p>We're sorry, the application failed to load. Please try refreshing the page.</p>
          <p style="font-size: 0.8rem; color: #64748b;">Technical details: ${error instanceof Error ? error.message : String(error)}</p>
        </div>
      `
    }
  }
})()

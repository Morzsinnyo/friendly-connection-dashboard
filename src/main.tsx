
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Simple and direct React initialization with improved error handling
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded, starting React initialization');
  
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found - cannot mount React');
    document.body.innerHTML = '<div>Cannot find root element</div>';
    return;
  }
  
  try {
    // Remove loading fallback if it exists
    const fallback = document.getElementById('loading-fallback');
    if (fallback) {
      fallback.remove();
    }
    
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('React app rendered successfully');
    
    // Signal successful initialization
    window.__REACT_INITIALIZED = true;
    
  } catch (error) {
    console.error('Error initializing React app:', error);
    
    // Display error in the UI
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h2 style="color: #e11d48;">React Initialization Error</h2>
        <p>Failed to start the application. Details:</p>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
});


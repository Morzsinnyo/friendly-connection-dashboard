
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Immediately check if we're in an iframe
const isInIframe = window !== window.parent;
console.log('Environment check - In iframe:', isInIframe);

// Simple and direct React initialization with improved iframe support
const initReact = () => {
  console.log('Starting React initialization, timestamp:', Date.now());
  
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
    window.__REACT_INIT_TIME = Date.now();
    
    // Add a visible signal that React is working
    const debugSignal = document.createElement('div');
    debugSignal.id = 'react-debug-signal';
    debugSignal.style.position = 'fixed';
    debugSignal.style.bottom = '10px';
    debugSignal.style.right = '10px';
    debugSignal.style.background = 'green';
    debugSignal.style.color = 'white';
    debugSignal.style.padding = '5px';
    debugSignal.style.borderRadius = '3px';
    debugSignal.style.fontSize = '10px';
    debugSignal.textContent = 'React Active';
    document.body.appendChild(debugSignal);
    
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
};

// Run initialization either immediately or on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReact);
} else {
  // DOM already loaded, run immediately
  initReact();
}

// Add a backup initialization for iframe scenarios
window.addEventListener('load', () => {
  // If React hasn't initialized by load, try again
  if (!window.__REACT_INITIALIZED) {
    console.log('Window load event - React not initialized yet, trying again');
    initReact();
  }
});

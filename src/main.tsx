
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Flag to prevent multiple initialization attempts
let initializationAttempted = false;

// Configuration for iframe compatibility
const isInIframe = window !== window.parent;
console.log('[MAIN] Environment check - In iframe:', isInIframe);
console.log('[MAIN] User agent:', navigator.userAgent);
console.log('[MAIN] Window location:', window.location.href);

// Robust React initialization function
const initReact = () => {
  // Prevent multiple init attempts
  if (initializationAttempted) {
    console.log('[MAIN] Skipping duplicate initialization attempt');
    return;
  }
  
  console.log('[MAIN] Starting React initialization, timestamp:', Date.now());
  initializationAttempted = true;
  
  try {
    // Get root element
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    // Clear any existing loading indicators
    const fallback = document.getElementById('loading-fallback');
    if (fallback) {
      console.log('[MAIN] Removing loading fallback');
      fallback.remove();
    }
    
    // Create root and render app
    console.log('[MAIN] Creating React root');
    const root = createRoot(rootElement);
    
    console.log('[MAIN] Rendering React app');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('[MAIN] React app rendered successfully');
    
    // Signal successful initialization
    window.__REACT_INITIALIZED = true;
    window.__REACT_INIT_TIME = Date.now();
    
    // Add visible signal that React is working
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
    debugSignal.style.zIndex = '9999';
    debugSignal.textContent = 'React Active';
    document.body.appendChild(debugSignal);
    
    // Update any external status indicators
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
      loadingStatus.textContent = 'React initialization complete!';
    }
    
    // For iframe scenarios, notify parent
    if (isInIframe) {
      try {
        window.parent.postMessage({ type: 'REACT_INITIALIZED', success: true }, '*');
      } catch (err) {
        console.warn('[MAIN] Could not communicate with parent frame:', err);
      }
    }
    
  } catch (error) {
    console.error('[MAIN] Error initializing React app:', error);
    
    // Handle error state
    const rootElement = document.getElementById('root');
    if (rootElement) {
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
    
    // For iframe scenarios, notify parent of failure
    if (isInIframe) {
      try {
        window.parent.postMessage({ 
          type: 'REACT_INIT_ERROR', 
          error: error instanceof Error ? error.message : String(error)
        }, '*');
      } catch (err) {
        console.warn('[MAIN] Could not communicate error to parent frame:', err);
      }
    }
  }
};

// Multi-stage initialization strategy
console.log('[MAIN] Preparing React initialization');

// Immediate initialization if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('[MAIN] Document still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[MAIN] DOMContentLoaded fired, initializing React');
    initReact();
  });
} else {
  // DOM already loaded, run immediately
  console.log('[MAIN] Document already loaded, initializing React immediately');
  initReact();
}

// Backup initialization triggers
window.addEventListener('load', () => {
  console.log('[MAIN] Window load event fired');
  if (!window.__REACT_INITIALIZED) {
    console.log('[MAIN] React not initialized by load event, trying again');
    initReact();
  }
});

// Special handling for iframe scenarios
if (isInIframe) {
  console.log('[MAIN] Adding iframe-specific initialization support');
  
  // Listen for messages from parent
  window.addEventListener('message', (event) => {
    console.log('[MAIN] Received message in iframe:', event.data);
    
    // Handle initialization request from parent
    if (event.data?.type === 'INIT_REACT') {
      console.log('[MAIN] Received initialization request from parent');
      if (!window.__REACT_INITIALIZED) {
        initReact();
      }
    }
  });
}

// Expose initialization function globally for manual triggering
window.__MANUAL_REACT_INIT = initReact;

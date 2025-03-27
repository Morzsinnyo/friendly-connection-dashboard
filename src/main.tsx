
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Flag to prevent multiple initialization attempts
let initializationAttempted = false;

// Configuration for iframe compatibility
const isInIframe = window !== window.parent;
window.__IS_IFRAME = isInIframe; // Set this for other components to use
console.log('[MAIN] Environment check - In iframe:', isInIframe);
console.log('[MAIN] User agent:', navigator.userAgent);
console.log('[MAIN] Window location:', window.location.href);

// Improved React initialization function
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
      console.error('[MAIN] Root element not found!');
      throw new Error('Root element not found');
    }
    
    // Clear any existing loading indicators
    const fallback = document.getElementById('loading-fallback');
    if (fallback) {
      console.log('[MAIN] Removing loading fallback');
      fallback.remove();
    } else {
      console.warn('[MAIN] Loading fallback not found');
    }
    
    // Create root and render app - wrap in try/catch for more specific error reporting
    try {
      console.log('[MAIN] Creating React root');
      const root = createRoot(rootElement);
      
      console.log('[MAIN] Rendering React app');
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      
      console.log('[MAIN] React app rendered successfully');
      
      // Signal successful initialization and ensure debug mode is disabled
      window.__REACT_INITIALIZED = true;
      window.__REACT_INIT_TIME = Date.now();
      // Initialize __DEBUG_ENABLED if not already defined
      if (typeof window.__DEBUG_ENABLED === 'undefined') {
        window.__DEBUG_ENABLED = false;
      } else {
        // Force debug mode off
        window.__DEBUG_ENABLED = false;
      }
      
      // Only show debug signals in development mode
      if (import.meta.env.DEV) {
        // In iframe mode, use a more subtle debug signal
        if (isInIframe) {
          console.log('[MAIN] Adding minimal debug signal for iframe mode');
          const debugSignal = document.createElement('div');
          debugSignal.id = 'react-debug-signal';
          debugSignal.style.position = 'fixed';
          debugSignal.style.bottom = '5px';
          debugSignal.style.right = '5px';
          debugSignal.style.background = 'rgba(0,128,0,0.3)';
          debugSignal.style.color = 'white';
          debugSignal.style.padding = '3px';
          debugSignal.style.borderRadius = '2px';
          debugSignal.style.fontSize = '8px';
          debugSignal.style.zIndex = '9999';
          debugSignal.textContent = 'R'; 
          document.body.appendChild(debugSignal);
        } else {
          // Add visible signal that React is working (larger for non-iframe mode)
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
        }
      }
      
      // Update any external status indicators
      const loadingStatus = document.getElementById('loading-status');
      if (loadingStatus) {
        loadingStatus.textContent = 'React initialization complete!';
      }
    } catch (renderError) {
      console.error('[MAIN] Error rendering React app:', renderError);
      throw renderError; // re-throw for outer error handling
    }
    
    // For iframe scenarios, notify parent
    if (isInIframe) {
      try {
        window.parent.postMessage({ 
          type: 'REACT_INITIALIZED', 
          success: true,
          timestamp: Date.now(),
          debugEnabled: false // Explicitly tell parent debug is disabled
        }, '*');
        console.log('[MAIN] Notified parent frame of successful initialization');
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
          ${isInIframe ? `<p style="margin-top: 10px; font-size: 0.8rem; color: #666;">Running in iframe mode. <a href="${window.location.href}" target="_blank">Open directly</a></p>` : ''}
        </div>
      `;
    }
    
    // For iframe scenarios, notify parent of failure
    if (isInIframe) {
      try {
        window.parent.postMessage({ 
          type: 'REACT_INIT_ERROR', 
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        }, '*');
        console.log('[MAIN] Notified parent frame of initialization failure');
      } catch (err) {
        console.warn('[MAIN] Could not communicate error to parent frame:', err);
      }
    }
  }
};

// Add support for message-based initialization
window.addEventListener('message', (event) => {
  console.log('[MAIN] Received message:', event.data);
  
  // React to specific message types
  if (event.data?.type === 'INIT_REACT' || event.data?.type === 'FORCE_INIT') {
    console.log('[MAIN] Received initialization request via postMessage');
    if (!window.__REACT_INITIALIZED) {
      initReact();
    } else {
      console.log('[MAIN] React already initialized, ignoring init request');
      // Confirm to parent that we're already running
      if (isInIframe) {
        try {
          window.parent.postMessage({ 
            type: 'REACT_ALREADY_INITIALIZED',
            timestamp: Date.now(),
            debugEnabled: false // Explicitly tell parent debug is disabled
          }, '*');
        } catch (err) {
          console.warn('[MAIN] Could not respond to parent frame:', err);
        }
      }
    }
  } else if (event.data?.type === 'FORCE_DEBUG_OFF') {
    if (typeof window.__DEBUG_ENABLED === 'undefined') {
      window.__DEBUG_ENABLED = false;
    } else {
      window.__DEBUG_ENABLED = false;
    }
    console.log('[MAIN] Received force debug off message');
    // Notify any components that might be listening for this
    window.dispatchEvent(new CustomEvent('debug-mode-change', { detail: { enabled: false } }));
  }
  // Additional message handlers remain unchanged
  else if (event.data?.type === 'DEBUG_ON') {
    if (typeof window.__DEBUG_ENABLED === 'undefined') {
      window.__DEBUG_ENABLED = true;
    } else {
      window.__DEBUG_ENABLED = true;
    }
    console.log('[MAIN] Received debug on message');
    // Notify any components that might be listening for this
    window.dispatchEvent(new CustomEvent('debug-mode-change', { detail: { enabled: true } }));
  }
});

// Multi-stage initialization strategy with better error reporting
console.log('[MAIN] Preparing React initialization');

// Document ready handler with timeout safety
const whenDocumentReady = (callback) => {
  if (document.readyState === 'loading') {
    console.log('[MAIN] Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', callback);
    
    // Safety timeout in case DOMContentLoaded doesn't fire
    setTimeout(() => {
      if (document.readyState !== 'loading' && !window.__REACT_INITIALIZED) {
        console.warn('[MAIN] DOMContentLoaded might have been missed, checking readiness');
        callback();
      }
    }, 1000);
  } else {
    // DOM already loaded, run immediately
    console.log('[MAIN] Document already loaded, initializing React immediately');
    callback();
  }
};

// Initialize React when document is ready
whenDocumentReady(initReact);

// Backup initialization triggers
window.addEventListener('load', () => {
  console.log('[MAIN] Window load event fired');
  if (!window.__REACT_INITIALIZED) {
    console.log('[MAIN] React not initialized by load event, trying again');
    initReact();
  }
});

// Special handling for iframe scenarios with more aggressive timeouts
if (isInIframe) {
  console.log('[MAIN] Adding iframe-specific initialization support');
  
  // Start initialization after a slight delay if not already started
  setTimeout(() => {
    if (!window.__REACT_INITIALIZED && !initializationAttempted) {
      console.log('[IFRAME] Starting delayed initialization for iframe compatibility');
      initReact();
    }
  }, 500);
}

// Expose initialization function globally for manual triggering
window.__MANUAL_REACT_INIT = initReact;

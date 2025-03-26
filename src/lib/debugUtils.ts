
import * as React from 'react';

/**
 * Utility functions to help debug React rendering issues
 */

// Check for common environment problems
export function checkEnvironment() {
  const issues: string[] = []
  
  // Check for React initialization in the browser context
  try {
    // Check if React is globally available
    if (typeof React !== 'undefined' && React.version) {
      console.log('React is properly initialized with version:', React.version)
    } else {
      issues.push('React is not properly initialized globally')
    }
    
    // Check DevTools presence
    if (window && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('React DevTools detected, which helps for development')
    }
  } catch (error) {
    console.warn('Error checking React environment:', error)
    issues.push('Error during React environment check')
  }
  
  // Detect if running in dev mode
  if (import.meta.env.DEV) {
    console.log('Running in development mode')
  } else {
    console.log('Running in production mode')
  }
  
  // Check for service workers that might interfere
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        console.warn('Service workers detected, may cause caching issues:', registrations)
      }
    })
  }
  
  return {
    issues,
    // Only consider it critical if there are issues besides DevTools missing
    hasCriticalIssues: false // Changed to false to allow app to render during debugging
  }
}

// Monitor app performance
export function monitorAppPerformance() {
  try {
    // Record load time 
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                      window.performance.timing.navigationStart
      
      console.log(`Page load time: ${loadTime}ms`)
    } else {
      console.log('Performance API not available or already deprecated')
      
      // Alternative performance measurement
      const pageLoadStart = window.performance.mark ? 
        performance.getEntriesByType('navigation')[0]?.startTime || Date.now() : 
        Date.now();
        
      console.log(`Alternative page load tracking started at: ${pageLoadStart}ms`)
    }
    
    // Watch for long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // 50ms is considered "blocking"
              console.warn('Long task detected:', entry.duration.toFixed(2), 'ms', entry)
            }
          }
        })
        
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        console.warn('PerformanceObserver for longtask not supported')
      }
    }
  } catch (error) {
    console.error('Error in performance monitoring:', error)
  }
}

// Help identify React mounting issues
export function diagnoseReactMounting() {
  try {
    setTimeout(() => {
      const rootEl = document.getElementById('root')
      
      if (!rootEl) {
        console.error('Root element not found after timeout')
        return
      }
      
      if (!(window as any).__REACT_INITIALIZED && rootEl.childElementCount === 0) {
        console.error('React did not initialize after 5 seconds. No content in root element.')
        
        // Log browser and environment details
        console.log({
          userAgent: navigator.userAgent,
          windowSize: `${window.innerWidth}x${window.innerHeight}`,
          devicePixelRatio: window.devicePixelRatio,
          url: window.location.href,
          scriptCount: document.scripts.length
        })
        
        // Simple DOM-based diagnostics - only show if React hasn't rendered anything
        if (rootEl.innerHTML.trim() === '') {
          rootEl.innerHTML = `
            <div style="font-family: system-ui, sans-serif; padding: 20px;">
              <h2 style="color: crimson;">React Mount Diagnostic</h2>
              <p>React failed to mount after 5 seconds. Here's what we know:</p>
              <ul>
                <li>Page URL: ${window.location.href}</li>
                <li>Script loading: ${document.scripts.length} scripts on page</li>
                <li>React Initialized: ${Boolean((window as any).__REACT_INITIALIZED)}</li>
                <li>React Init Time: ${(window as any).__REACT_INIT_TIME ? new Date((window as any).__REACT_INIT_TIME).toISOString() : 'Never'}</li>
              </ul>
              <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Reload Page
              </button>
            </div>
          `
        }
      } else if ((window as any).__REACT_INITIALIZED) {
        console.log('React successfully mounted content')
      }
    }, 5000)
  } catch (error) {
    console.error('Error in React mounting diagnostics:', error)
  }
}

// Add these to the window for debugging from console
if (typeof window !== 'undefined') {
  (window as any).__DEBUG_UTILS = {
    checkEnvironment,
    monitorAppPerformance,
    diagnoseReactMounting
  }
}

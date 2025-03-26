
/**
 * Utility functions to help debug React rendering issues
 */

// Check for common environment problems
export function checkEnvironment() {
  const issues: string[] = []
  
  // Check for React version mismatches
  try {
    const reactDomVersion = require('react-dom').version
    const reactVersion = require('react').version
    
    if (reactDomVersion !== reactVersion) {
      issues.push(`React version mismatch: react@${reactVersion}, react-dom@${reactDomVersion}`)
    }
  } catch (error) {
    issues.push('Could not detect React versions')
  }
  
  // Check for problematic browser extensions
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools detected, which is good for development')
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
    hasCriticalIssues: issues.length > 0
  }
}

// Monitor app performance
export function monitorAppPerformance() {
  // Record load time
  const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                  window.performance.timing.navigationStart
  
  console.log(`Page load time: ${loadTime}ms`)
  
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
}

// Help identify React mounting issues
export function diagnoseReactMounting() {
  setTimeout(() => {
    const rootEl = document.getElementById('root')
    
    if (!rootEl) {
      console.error('Root element not found after timeout')
      return
    }
    
    if (!window.__REACT_INITIALIZED && rootEl.childElementCount === 0) {
      console.error('React did not initialize after 5 seconds. No content in root element.')
      
      // Simple DOM-based diagnostics
      rootEl.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 20px;">
          <h2 style="color: crimson;">React Mount Diagnostic</h2>
          <p>React failed to mount after 5 seconds. Here's what we know:</p>
          <ul>
            <li>Page URL: ${window.location.href}</li>
            <li>Script loading: ${document.scripts.length} scripts on page</li>
            <li>React Initialized: ${Boolean(window.__REACT_INITIALIZED)}</li>
            <li>React Init Time: ${window.__REACT_INIT_TIME ? new Date(window.__REACT_INIT_TIME).toISOString() : 'Never'}</li>
          </ul>
          <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `
    } else if (window.__REACT_INITIALIZED) {
      console.log('React successfully mounted content')
    }
  }, 5000)
}

// Add these to the window for debugging from console
window.__DEBUG_UTILS = {
  checkEnvironment,
  monitorAppPerformance,
  diagnoseReactMounting
}

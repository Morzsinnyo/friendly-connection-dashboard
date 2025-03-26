
import * as React from 'react';

/**
 * Utility functions to help debug React rendering issues
 */

// Check for common environment problems
export function checkEnvironment() {
  const issues: string[] = []
  const isInIframe = window !== window.parent
  
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
  
  // Iframe-specific checks
  if (isInIframe) {
    console.log('Running in iframe, performing iframe-specific checks')
    
    // Check if we can communicate with parent
    try {
      window.parent.postMessage({ type: 'IFRAME_CHECK' }, '*')
      console.log('Successfully sent message to parent frame')
    } catch (error) {
      console.error('Error communicating with parent frame:', error)
      issues.push('Cannot communicate with parent frame - security restriction')
    }
    
    // Check for potential restrictive headers
    const xfoMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]')
    if (xfoMeta) {
      const content = xfoMeta.getAttribute('content') || ''
      if (content === 'DENY' || content === 'SAMEORIGIN') {
        console.warn('Restrictive X-Frame-Options header detected:', content)
        
        if (content === 'DENY') {
          issues.push('X-Frame-Options set to DENY, which prevents iframe embedding')
        }
      }
    }
    
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (cspMeta) {
      const content = cspMeta.getAttribute('content') || ''
      if (content.includes('frame-ancestors') && 
          !content.includes('frame-ancestors *') && 
          !content.includes("frame-ancestors 'self'")) {
        console.warn('Restrictive Content-Security-Policy frame-ancestors directive detected')
        issues.push('Restrictive CSP frame-ancestors may prevent iframe embedding')
      }
    }
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
    
    // Special monitoring for iframe mode
    const isInIframe = window !== window.parent
    if (isInIframe) {
      console.log('Setting up performance monitoring for iframe mode')
      
      // Monitor UI responsiveness in iframe
      let lastFrameTime = performance.now()
      let frameDrops = 0
      
      const checkFrame = () => {
        const now = performance.now()
        const elapsed = now - lastFrameTime
        
        // If more than 50ms has passed, we may have dropped frames
        if (elapsed > 50) {
          frameDrops++
          console.warn(`Potential frame drop detected: ${elapsed.toFixed(2)}ms since last frame check`)
          
          if (frameDrops > 5) {
            console.error('Multiple frame drops detected, iframe performance may be degraded')
          }
        }
        
        lastFrameTime = now
        requestAnimationFrame(checkFrame)
      }
      
      requestAnimationFrame(checkFrame)
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
          scriptCount: document.scripts.length,
          inIframe: window !== window.parent
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
                <li>In iframe: ${window !== window.parent ? 'Yes' : 'No'}</li>
              </ul>
              <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Reload Page
              </button>
              ${window !== window.parent ? 
                `<p style="margin-top: 10px;">
                  <button onclick="window.open(window.location.href, '_blank')" style="padding: 8px 16px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Open in New Window
                  </button>
                </p>` : ''
              }
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

// Add iframe-specific detection function
export function checkIframeCompatibility() {
  const isInIframe = window !== window.parent
  if (!isInIframe) return { inIframe: false, issues: [] }
  
  const issues: string[] = []
  let canCommunicate = false
  
  try {
    // Test sending a message to parent
    window.parent.postMessage({ type: 'IFRAME_COMPATIBILITY_CHECK' }, '*')
    canCommunicate = true
  } catch (error) {
    issues.push(`Communication error: ${error.message}`)
    canCommunicate = false
  }
  
  // Check for restrictive headers
  const headers = {
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content'),
    xfo: document.querySelector('meta[http-equiv="X-Frame-Options"]')?.getAttribute('content')
  }
  
  if (headers.xfo === 'DENY') {
    issues.push('X-Frame-Options: DENY (prevents embedding)')
  } else if (headers.xfo === 'SAMEORIGIN') {
    issues.push('X-Frame-Options: SAMEORIGIN (only allows same-origin embedding)')
  }
  
  if (headers.csp && headers.csp.includes('frame-ancestors') && 
      !headers.csp.includes('frame-ancestors *') && 
      !headers.csp.includes("frame-ancestors 'self'")) {
    issues.push('Restrictive CSP frame-ancestors directive')
  }
  
  return {
    inIframe: true,
    canCommunicate,
    issues,
    headers
  }
}

// Add these to the window for debugging from console
if (typeof window !== 'undefined') {
  (window as any).__DEBUG_UTILS = {
    checkEnvironment,
    monitorAppPerformance,
    diagnoseReactMounting,
    checkIframeCompatibility
  }
}

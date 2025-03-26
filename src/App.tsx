
import { useEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { ThemeProvider } from "./components/theme/ThemeProvider"
import { Toaster } from "sonner"
import { initPostHog } from "./lib/posthog"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "./components/common/ErrorBoundary"
import { checkEnvironment, diagnoseReactMounting, monitorAppPerformance } from "./lib/debugUtils"
import { TestComponent } from "./components/debug/TestComponent"
import "./App.css"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  const [mounted, setMounted] = useState(false)
  const [envCheck, setEnvCheck] = useState<{issues: string[], hasCriticalIssues: boolean} | null>(null)
  const [debugMode, setDebugMode] = useState(false) // Always off by default
  const isInIframe = window !== window.parent

  useEffect(() => {
    console.log('[APP] App component mounting, timestamp:', Date.now())
    console.log('[APP] Running in iframe:', isInIframe)
    
    // For iframe mode, add specific attributes to help debugging
    if (isInIframe) {
      document.body.classList.add('in-iframe-mode');
      document.documentElement.dataset.frameStatus = 'app-mounting';
    }
    
    // Run diagnostic functions
    try {
      const envIssues = checkEnvironment()
      setEnvCheck(envIssues)
      
      if (envIssues.hasCriticalIssues) {
        console.error('[APP] Critical environment issues detected:', envIssues.issues)
      } else if (envIssues.issues.length > 0) {
        console.warn('[APP] Non-critical environment issues detected:', envIssues.issues)
      } else {
        console.log('[APP] Environment check passed, no issues detected')
      }
      
      monitorAppPerformance()
      diagnoseReactMounting()
    } catch (error) {
      console.error('[APP] Error during environment checks:', error)
    }
    
    // Initialize PostHog
    try {
      initPostHog()
      console.log('[APP] PostHog initialized successfully')
    } catch (error) {
      console.error('[APP] PostHog initialization error:', error)
    }
    
    setMounted(true)
    
    // Always force debug mode off, especially in iframe mode
    if (debugMode) {
      setDebugMode(false)
      console.log('[APP] Forcing debug mode off')
    }
    
    // Exit debug mode automatically in iframes after a short delay
    if (isInIframe) {
      console.log('[APP] In iframe, debug mode will remain off')
      document.documentElement.dataset.frameStatus = 'app-running';
      
      // Notify parent frame that app is fully running
      try {
        window.parent.postMessage({ 
          type: 'APP_RUNNING', 
          timestamp: Date.now()
        }, '*');
      } catch (err) {
        console.warn('[APP] Could not notify parent that app is running:', err);
      }
    }
    
    // Setup listener for iframe-specific messages
    if (isInIframe) {
      const messageHandler = (event) => {
        console.log('[APP] Received message in iframe App component:', event.data);
        
        // Handle specific message types here if needed
        if (event.data?.type === 'EXIT_DEBUG') {
          setDebugMode(false);
        }
      };
      
      window.addEventListener('message', messageHandler);
      return () => window.removeEventListener('message', messageHandler);
    }
    
    return () => {
      console.log('[APP] App component unmounting')
    }
  }, [isInIframe, debugMode])

  // Show diagnostic message while app is initializing
  if (!mounted) {
    return <div id="mounting-diagnostic" style={{
      padding: '20px',
      margin: '20px',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h2>React App Initializing</h2>
      <p>Please wait while the application loads...</p>
      <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
      <p><strong>In iframe:</strong> {isInIframe ? 'Yes' : 'No'}</p>
    </div>
  }

  // Only show environment issues if they are critical
  if (envCheck?.hasCriticalIssues) {
    return (
      <div className="environment-issue-container" style={{
        padding: '20px',
        margin: '20px',
        backgroundColor: '#fee2e2',
        borderRadius: '8px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h2>Environment Issues Detected</h2>
        <ul>
          {envCheck.issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
        <p>These issues may prevent the application from functioning correctly.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Application
        </button>
      </div>
    )
  }

  // Debug mode is completely bypassed - we always return the main app
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
          {isInIframe && (
            <div 
              style={{
                position: 'fixed',
                bottom: '5px',
                right: '5px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                padding: '2px 4px',
                borderRadius: '2px',
                fontSize: '9px',
                zIndex: 9999
              }}
            >
              iframe
            </div>
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App

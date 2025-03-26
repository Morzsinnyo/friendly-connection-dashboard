
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
  const [debugMode, setDebugMode] = useState(true)
  const isInIframe = window !== window.parent

  useEffect(() => {
    console.log('[APP] App component mounting, timestamp:', Date.now())
    console.log('[APP] Running in iframe:', isInIframe)
    
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
    
    // Exit debug mode automatically in iframes after a short delay
    if (isInIframe) {
      console.log('[APP] In iframe, will exit debug mode automatically after 2 seconds')
      setTimeout(() => {
        setDebugMode(false)
        console.log('[APP] Auto-exiting debug mode in iframe')
      }, 2000)
    }
    
    return () => {
      console.log('[APP] App component unmounting')
    }
  }, [isInIframe])

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

  // Show debug component in debug mode
  if (debugMode) {
    return (
      <div className="app-debug-mode">
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '8px',
          backgroundColor: '#111827',
          color: 'white',
          textAlign: 'center',
          fontSize: '14px',
          zIndex: 1000
        }}>
          React is running in debug mode {isInIframe ? '(inside iframe)' : ''}
        </div>
        
        <TestComponent />
        
        <button 
          onClick={() => setDebugMode(false)}
          style={{
            padding: '8px 16px',
            margin: '20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Continue to Full App
        </button>
      </div>
    );
  }

  // Wrap the entire app in an error boundary
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App

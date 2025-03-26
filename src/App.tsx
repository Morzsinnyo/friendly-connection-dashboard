
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
  const [debugMode, setDebugMode] = useState(true) // Enable debug mode by default

  useEffect(() => {
    console.log('App component mounting, timestamp:', Date.now())
    
    // Run diagnostic functions - but don't let them block rendering
    try {
      const envIssues = checkEnvironment()
      setEnvCheck(envIssues)
      
      if (envIssues.hasCriticalIssues) {
        console.error('Critical environment issues detected:', envIssues.issues)
      } else if (envIssues.issues.length > 0) {
        console.warn('Non-critical environment issues detected:', envIssues.issues)
      } else {
        console.log('Environment check passed, no issues detected')
      }
      
      monitorAppPerformance()
      diagnoseReactMounting()
    } catch (error) {
      console.error('Error during environment checks:', error)
      // Continue rendering even if environment checks fail
    }
    
    // Initialize PostHog
    try {
      initPostHog()
      console.log('PostHog initialized successfully')
    } catch (error) {
      console.error('PostHog initialization error:', error)
      // Continue even if PostHog fails, it's not critical
    }
    
    setMounted(true)
    
    // Add global error handler to catch React errors
    const originalError = console.error
    console.error = (...args) => {
      // Check if this is a React-related error
      const errorText = args.join(' ')
      if (errorText.includes('React') || errorText.includes('render')) {
        console.log('React error detected:', errorText)
      }
      originalError.apply(console, args)
    }
    
    return () => {
      console.error = originalError
    }
  }, [])

  // Show diagnostic message while app is initializing
  if (!mounted) {
    return <div id="mounting-diagnostic">React App is initializing... Please wait.</div>
  }

  // Only show environment issues if they are critical AND we want to block rendering
  if (envCheck?.hasCriticalIssues) {
    return (
      <div className="environment-issue-container">
        <h2>Environment Issues Detected</h2>
        <ul>
          {envCheck.issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
        <p>These issues may prevent the application from functioning correctly.</p>
        <button onClick={() => window.location.reload()}>
          Reload Application
        </button>
      </div>
    )
  }

  // Show debug component in debug mode
  if (debugMode) {
    return (
      <div className="app-debug-mode">
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

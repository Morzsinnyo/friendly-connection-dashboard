
import { useEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { ThemeProvider } from "./components/theme/ThemeProvider"
import { Toaster } from "sonner"
import { initPostHog } from "./lib/posthog"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "./components/common/ErrorBoundary"
import { checkEnvironment, diagnoseReactMounting, monitorAppPerformance } from "./lib/debugUtils"
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

  useEffect(() => {
    console.log('App component mounting, timestamp:', Date.now())
    
    // Run diagnostic functions
    const envIssues = checkEnvironment()
    setEnvCheck(envIssues)
    
    if (envIssues.hasCriticalIssues) {
      console.error('Critical environment issues detected:', envIssues.issues)
    } else if (envIssues.issues.length > 0) {
      console.warn('Non-critical environment issues detected:', envIssues.issues)
    }
    
    monitorAppPerformance()
    diagnoseReactMounting()
    
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

  // Only show environment issues if they are critical
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

  // Add diagnostic HTML to help debug mounting issues
  if (!mounted) {
    return <div id="mounting-diagnostic">React App is initializing...</div>
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


import { useEffect, useState } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { ThemeProvider } from "./components/theme/ThemeProvider"
import { Toaster } from "sonner"
import { initPostHog } from "./lib/posthog"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "./components/common/ErrorBoundary"
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

  useEffect(() => {
    // Initialize PostHog
    try {
      initPostHog()
      console.log('PostHog initialized successfully')
    } catch (error) {
      console.error('PostHog initialization error:', error)
      // Continue even if PostHog fails, it's not critical
    }
    
    // Add diagnostic log to confirm mounting
    console.log('App component mounted')
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

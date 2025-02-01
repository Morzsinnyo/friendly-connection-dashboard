import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { ThemeProvider } from "./components/theme/ThemeProvider"
import { Toaster } from "sonner"
import { initPostHog } from "./lib/posthog"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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
  useEffect(() => {
    // Initialize PostHog
    initPostHog()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { ThemeProvider } from "./components/theme/ThemeProvider"
import { Toaster } from "sonner"
import { initPostHog } from "./lib/posthog"
import "./App.css"

function App() {
  useEffect(() => {
    // Initialize PostHog
    initPostHog()
  }, [])

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}

export default App
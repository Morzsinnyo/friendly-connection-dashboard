
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root element and render the app
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Failed to find the root element')
  document.body.innerHTML = '<div>Failed to mount React app - root element not found</div>'
} else {
  const root = createRoot(rootElement)
  root.render(<App />)
}

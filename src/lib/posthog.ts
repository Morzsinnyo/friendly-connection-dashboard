import posthog from 'posthog-js'

// Only initialize PostHog in production
const initPostHog = () => {
  console.log('[PostHog] Initializing PostHog...')
  
  if (import.meta.env.DEV) {
    console.log('[PostHog] Development environment detected, skipping initialization')
    return
  }

  try {
    posthog.init('phc_owHNkyTZXR7HuBwuefedLQhhOIjTK8sRjx0JuPazZTj', {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      loaded: function(posthog) {
        console.log('[PostHog] Successfully loaded')
      },
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true, // Disable session recording by default
      debug: import.meta.env.DEV, // Enable debug mode in development
    })

    // Enable debugging in development
    if (import.meta.env.DEV) {
      posthog.debug()
    }
  } catch (error) {
    console.error('[PostHog] Failed to initialize:', error)
  }
}

export { posthog, initPostHog }
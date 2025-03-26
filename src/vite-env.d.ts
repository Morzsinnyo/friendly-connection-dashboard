
/// <reference types="vite/client" />

interface Window {
  gapi: any;
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  __REACT_INITIALIZED?: boolean;
  __REACT_INIT_TIME?: number;
  posthog?: any; // Added for PostHog
  __DEBUG_UTILS?: {
    checkEnvironment: () => { issues: string[], hasCriticalIssues: boolean };
    monitorAppPerformance: () => void;
    diagnoseReactMounting: () => void;
  };
}

// Declare global React variable for browser context
declare global {
  // For React global detection
  const React: {
    version: string;
    createElement: Function;
    Fragment: any;
    [key: string]: any;
  };
}

// This export is needed to make this a module
export {};

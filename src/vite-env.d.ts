
/// <reference types="vite/client" />

// Define window properties used in the application
interface Window {
  gapi: any;
  __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
  __REACT_INITIALIZED: boolean;
  __REACT_INIT_TIME: number;
  __JS_CHECK: boolean;
  posthog?: any;
  __DEBUG_UTILS?: {
    checkEnvironment: () => { issues: string[], hasCriticalIssues: boolean };
    monitorAppPerformance: () => void;
    diagnoseReactMounting: () => void;
  };
  // Add React to window for debugging purposes
  React?: any;
  // Add Vite-specific properties
  $RefreshReg$?: () => void;
  $RefreshSig$?: () => (type: any) => any;
}

// Make sure React is available globally
declare global {
  // React must be available when using JSX
  import React from 'react';
  namespace JSX {}
}

// This export is needed to make this a module
export {};

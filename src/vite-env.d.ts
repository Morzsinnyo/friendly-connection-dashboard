
/// <reference types="vite/client" />

// Define window properties used in the application
declare global {
  interface Window {
    gapi: any;
    __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
    __REACT_INITIALIZED: boolean;
    __REACT_INIT_TIME: number;
    __JS_CHECK: boolean;
    __MANUAL_REACT_INIT: () => void;
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
    __IS_IFRAME?: boolean; // Property for iframe detection
    __DEBUG_ENABLED?: boolean; // Add missing DEBUG_ENABLED property
  }
}

// This export is needed to make this a module
export {};

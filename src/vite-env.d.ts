
/// <reference types="vite/client" />

interface Window {
  gapi: any;
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  __REACT_INITIALIZED?: boolean;
  __REACT_INIT_TIME?: number;
  __DEBUG_UTILS?: {
    checkEnvironment: () => { issues: string[], hasCriticalIssues: boolean };
    monitorAppPerformance: () => void;
    diagnoseReactMounting: () => void;
  };
}

// Add global React variable check
declare var React: {
  version: string;
  [key: string]: any;
};

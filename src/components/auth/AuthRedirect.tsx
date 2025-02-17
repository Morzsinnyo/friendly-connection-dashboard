
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { useEffect } from "react";

export const AuthRedirect = () => {
  const location = useLocation();
  const { handleRedirectState } = useAuthSession();
  const hasAuthParams = location.hash.includes("access_token") || 
                       location.hash.includes("error_description") ||
                       location.hash.includes("provider");

  console.log("[AuthRedirect] Current location:", location);
  console.log("[AuthRedirect] Has auth params:", hasAuthParams);

  useEffect(() => {
    if (hasAuthParams) {
      console.log("[AuthRedirect] Detected auth params, handling auth state");
      handleRedirectState();
    }
  }, [hasAuthParams, handleRedirectState]);

  if (hasAuthParams) {
    console.log("[AuthRedirect] Processing auth...");
    return null; // Let useEffect handle the redirect
  }

  console.log("[AuthRedirect] No auth params, redirecting to landing page");
  return <Navigate to="/" replace />;
};

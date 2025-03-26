
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { AuthLoadingState } from "./AuthLoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("[ProtectedRoute] Current location:", location.pathname);
    console.log("[ProtectedRoute] Auth state:", { isAuthenticated, isLoading });
    
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store the attempted URL to redirect back after auth
        const returnTo = location.pathname + location.search;
        console.log("[ProtectedRoute] Storing return path:", returnTo);
        sessionStorage.setItem('returnTo', returnTo);
        navigate("/auth", { replace: true });
      }
      setIsInitialized(true);
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading || !isInitialized) {
    return <AuthLoadingState message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

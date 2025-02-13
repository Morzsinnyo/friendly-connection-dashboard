
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
    console.log("[ProtectedRoute] Auth state:", { isAuthenticated, isLoading, path: location.pathname });
    
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("[ProtectedRoute] User not authenticated, redirecting to /auth");
        navigate("/auth");
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

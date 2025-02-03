import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { AuthLoadingState } from "./AuthLoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[ProtectedRoute] Auth state:", { isAuthenticated, isLoading });
    
    if (!isLoading && !isAuthenticated) {
      console.log("[ProtectedRoute] User not authenticated, redirecting to /auth");
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <AuthLoadingState message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { AuthLoadingState } from "@/components/auth/AuthLoadingState";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { useAuthError } from "@/components/auth/hooks/useAuthError";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SITE_URL = "https://friendly-connection-dashboard.lovable.app";

const Auth = () => {
  const { isLoading, isAuthenticated } = useAuthState();
  const { handleRedirectState, checkSession } = useAuthSession();
  const { handleAuthError } = useAuthError();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    console.log("[Auth] Component mounted, initializing auth...");
    
    const initAuth = async () => {
      try {
        console.log("[Auth] Handling redirect state...");
        await handleRedirectState();
        console.log("[Auth] Checking session...");
        await checkSession();
      } catch (error) {
        console.error("[Auth] Initialization error:", error);
        handleAuthError(error);
      }
    };

    initAuth();

    return () => {
      console.log("[Auth] Component unmounting, cleaning up...");
      isMounted.current = false;
    };
  }, [handleRedirectState, checkSession, handleAuthError]);

  useEffect(() => {
    if (isAuthenticated && isMounted.current) {
      console.log("[Auth] User authenticated, showing success toast and redirecting...");
      toast({
        title: "Successfully authenticated",
        description: "Welcome back!",
      });
      navigate("/");
    }
  }, [isAuthenticated, toast, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log("[Auth] Showing loading state...");
    return <AuthLoadingState message="Checking authentication status..." />;
  }

  // Show loading state while authenticated (will be redirected)
  if (isAuthenticated) {
    console.log("[Auth] User authenticated, showing redirect loading state...");
    return <AuthLoadingState message="Redirecting to dashboard..." />;
  }

  console.log("[Auth] Rendering auth UI...");
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: {
                  background: 'rgb(59 130 246)',
                  color: 'white',
                  borderRadius: '0.375rem',
                },
                anchor: {
                  color: 'rgb(59 130 246)',
                },
              },
            }}
            providers={["google"]}
            redirectTo={SITE_URL}
            theme="light"
          />
        </div>
      </div>
    </AuthErrorBoundary>
  );
};

export default Auth;
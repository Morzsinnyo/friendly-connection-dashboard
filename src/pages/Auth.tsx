
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
      console.log("[Auth] User authenticated, checking for return path...");
      const returnTo = sessionStorage.getItem('returnTo');
      console.log("[Auth] Return path:", returnTo);
      
      toast({
        title: "Successfully authenticated",
        description: "Welcome back!",
      });

      if (returnTo) {
        console.log("[Auth] Navigating to stored path:", returnTo);
        sessionStorage.removeItem('returnTo'); // Clear the stored path
        navigate(returnTo);
      } else {
        console.log("[Auth] No stored path, navigating to dashboard");
        navigate("/dashboard");
      }
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#071A52]">
              Sign in to your account
            </h2>
          </div>
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: {
                  background: '#A7FF83',
                  color: '#071A52',
                  borderRadius: '9999px',
                  padding: '12px 32px',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                },
                input: {
                  borderWidth: '2px',
                  borderColor: '#071A52',
                  borderRadius: '9999px',
                  padding: '12px 24px',
                  fontSize: '1.125rem',
                },
                anchor: {
                  color: '#071A52',
                },
                message: {
                  color: '#071A52',
                },
                container: {
                  color: '#071A52',
                },
                label: {
                  color: '#071A52',
                },
                divider: {
                  background: '#071A52',
                },
              },
              className: {
                container: 'space-y-4',
                button: 'w-full',
              },
            }}
            providers={["google"]}
            redirectTo={SITE_URL}
            theme="light"
            view="sign_in"
          />
        </div>
      </div>
    </AuthErrorBoundary>
  );
};

export default Auth;

import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { AuthLoadingState } from "@/components/auth/AuthLoadingState";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { useAuthError } from "@/components/auth/hooks/useAuthError";
import { useToast } from "@/hooks/use-toast";

const SITE_URL = "https://friendly-connection-dashboard.lovable.app";

const Auth = () => {
  const { isLoading, isAuthenticated } = useAuthState();
  const { handleRedirectState, checkSession } = useAuthSession();
  const { handleAuthError } = useAuthError();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Auth component mounted");
    
    const initAuth = async () => {
      try {
        await handleRedirectState();
        await checkSession();
      } catch (error) {
        console.error("Auth initialization error:", error);
        handleAuthError(error);
      }
    };

    initAuth();
  }, [handleRedirectState, checkSession, handleAuthError]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User authenticated, showing success toast");
      toast({
        title: "Successfully authenticated",
        description: "Welcome back!",
      });
    }
  }, [isAuthenticated, toast]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingState message="Checking authentication status..." />;
  }

  // Show loading state while authenticated (will be redirected)
  if (isAuthenticated) {
    return <AuthLoadingState message="Redirecting to dashboard..." />;
  }

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
            onError={(error) => {
              console.error("Supabase Auth error:", error);
              handleAuthError(error);
            }}
            theme="light"
          />
        </div>
      </div>
    </AuthErrorBoundary>
  );
};

export default Auth;
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { AuthLoadingState } from "@/components/auth/AuthLoadingState";

const SITE_URL = "https://friendly-connection-dashboard.lovable.app";

const Auth = () => {
  const { isLoading, isAuthenticated } = useAuthState();
  const { handleRedirectState, checkSession } = useAuthSession();

  useEffect(() => {
    console.log("Auth component mounted");
    handleRedirectState();
    checkSession();
  }, [handleRedirectState, checkSession]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingState message="Checking authentication status..." />;
  }

  // Show loading state while authenticated (will be redirected)
  if (isAuthenticated) {
    return <AuthLoadingState message="Redirecting to dashboard..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          redirectTo={SITE_URL}
          theme="light"
        />
      </div>
    </div>
  );
};

export default Auth;
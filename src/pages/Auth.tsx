import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session) {
          // Verify session is valid before navigating
          const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
          if (currentSession?.session) {
            console.log("Valid session found, navigating to home");
            navigate("/");
          } else if (sessionError) {
            console.error("Session error:", sessionError);
            setErrorMessage(getErrorMessage(sessionError));
          }
        }
        
        if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
        }

        if (event === "USER_UPDATED") {
          const { error } = await supabase.auth.getSession();
          if (error) {
            console.error("User update error:", error);
            setErrorMessage(getErrorMessage(error));
          }
        }

        if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setErrorMessage(""); // Clear errors on sign out
        }
      }
    );

    // Check for existing session on component mount
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        console.log("Existing session found");
        navigate("/");
      } else if (error) {
        console.error("Session check error:", error);
        setErrorMessage(getErrorMessage(error));
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case "invalid_credentials":
          return "Invalid email or password. Please check your credentials and try again.";
        case "email_not_confirmed":
          return "Please verify your email address before signing in.";
        case "user_not_found":
          return "No user found with these credentials.";
        case "invalid_grant":
          return "Invalid login credentials.";
        case "refresh_token_not_found":
          return "Your session has expired. Please sign in again.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          theme="light"
        />
      </div>
    </div>
  );
};

export default Auth;
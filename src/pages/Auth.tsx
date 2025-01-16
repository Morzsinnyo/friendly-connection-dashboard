import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    console.log("Auth component mounted");
    
    // Handle URL fragment for OAuth redirects
    const handleRedirectState = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      
      if (accessToken) {
        console.log("Found access token in URL, checking session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Valid session found after OAuth redirect");
          navigate("/");
        } else if (error) {
          console.error("Session error after OAuth redirect:", error);
          setErrorMessage(getErrorMessage(error));
        }
      }
    };

    handleRedirectState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session) {
          console.log("Sign in event detected, checking session validity");
          const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
          if (currentSession?.session) {
            console.log("Valid session confirmed, navigating to home");
            navigate("/");
          } else if (sessionError) {
            console.error("Session validation error:", sessionError);
            setErrorMessage(getErrorMessage(sessionError));
          }
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
    console.error("Auth error:", error);
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
          redirectTo={`${window.location.origin}`}
          theme="light"
        />
      </div>
    </div>
  );
};

export default Auth;
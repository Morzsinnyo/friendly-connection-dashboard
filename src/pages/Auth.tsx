import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const SITE_URL = "https://friendly-connection-dashboard.lovable.app";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    console.log("Auth component mounted");
    console.log("Current URL:", window.location.href);
    console.log("Current origin:", window.location.origin);
    
    // Handle URL fragment for OAuth redirects
    const handleRedirectState = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        console.log("Hash params:", Object.fromEntries(hashParams.entries()));
        console.log("Access token from URL:", accessToken ? "Found" : "Not found");
        
        if (accessToken) {
          console.log("Found access token in URL, checking session...");
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session) {
            console.log("Valid session found after OAuth redirect:", session);
            navigate("/");
          } else if (error) {
            console.error("Session error after OAuth redirect:", error);
            console.error("Error details:", {
              message: error.message,
              status: error instanceof AuthApiError ? error.status : 'unknown',
              name: error.name
            });
            setErrorMessage(getErrorMessage(error));
          }
        } else {
          console.log("No access token found in URL");
        }
      } catch (error) {
        console.error("Error in handleRedirectState:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
        setErrorMessage("An error occurred during authentication. Please try again.");
      }
    };

    handleRedirectState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log("Auth state changed:", event);
          console.log("Session in auth state change:", session);
          
          if (event === "SIGNED_IN" && session) {
            console.log("Sign in event detected, checking session validity");
            const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
            
            if (currentSession?.session) {
              console.log("Valid session confirmed, navigating to home");
              console.log("Session details:", {
                user: currentSession.session.user,
                expiresAt: currentSession.session.expires_at
              });
              navigate("/");
            } else if (sessionError) {
              console.error("Session validation error:", sessionError);
              console.error("Session error details:", {
                message: sessionError.message,
                status: sessionError instanceof AuthApiError ? sessionError.status : 'unknown'
              });
              setErrorMessage(getErrorMessage(sessionError));
            }
          } else {
            console.log("Auth state change event without session:", event);
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          if (error instanceof Error) {
            console.error("Error stack:", error.stack);
          }
          setErrorMessage("An error occurred while processing your authentication. Please try again.");
        }
      }
    );

    // Check for existing session on component mount
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Existing session found:", {
            user: session.user,
            expiresAt: session.expires_at
          });
          navigate("/");
        } else if (error) {
          console.error("Session check error:", error);
          console.error("Session check error details:", {
            message: error.message,
            status: error instanceof AuthApiError ? error.status : 'unknown'
          });
          setErrorMessage(getErrorMessage(error));
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack
          });
        }
        setErrorMessage("An error occurred while checking your session. Please try again.");
      }
    };

    checkSession();

    return () => {
      console.log("Auth component unmounting");
      subscription.unsubscribe();
    };
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Processing auth error:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      status: error instanceof AuthApiError ? error.status : 'unknown'
    });
    
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          return "Invalid request. Please check your credentials and try again.";
        case 401:
          return "Unauthorized. Please sign in again.";
        case 403:
          return "Access forbidden. Please check your permissions.";
        case 404:
          return "Resource not found. Please try again later.";
        case 422:
          return "Invalid credentials. Please check your email and password.";
        case 429:
          return "Too many requests. Please wait a moment and try again.";
        default:
          return `Authentication error: ${error.message}`;
      }
    }
    
    return `Unexpected error: ${error.message}`;
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
          redirectTo={SITE_URL}
          theme="light"
        />
      </div>
    </div>
  );
};

export default Auth;

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useAuthSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRedirectState = useCallback(async () => {
    console.log("[useAuthSession] Handling redirect state");
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const error = hashParams.get("error_description");
    
    if (error) {
      console.error("[useAuthSession] Auth error:", error);
      toast({
        title: "Authentication Error",
        description: error,
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    if (accessToken) {
      console.log("[useAuthSession] Access token found in URL");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("[useAuthSession] Session error:", sessionError);
        toast({
          title: "Authentication Error",
          description: "Failed to get session",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      if (session) {
        console.log("[useAuthSession] Valid session, navigating to dashboard");
        toast({
          title: "Successfully authenticated",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      }
    }
  }, [navigate, toast]);

  const checkSession = useCallback(async () => {
    console.log("[useAuthSession] Checking existing session");
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("[useAuthSession] Existing session found, navigating to dashboard");
      navigate("/dashboard");
    }
  }, [navigate]);

  return {
    handleRedirectState,
    checkSession,
  };
};

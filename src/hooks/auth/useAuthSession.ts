
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuthSession = () => {
  const navigate = useNavigate();

  const handleRedirectState = useCallback(async () => {
    console.log("Handling redirect state");
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    
    if (accessToken) {
      console.log("Access token found in URL");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Valid session after redirect, navigating to dashboard");
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  const checkSession = useCallback(async () => {
    console.log("Checking existing session");
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("Existing session found, navigating to dashboard");
      navigate("/dashboard");
    }
  }, [navigate]);

  return {
    handleRedirectState,
    checkSession,
  };
};

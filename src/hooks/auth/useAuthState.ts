import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthState = {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export const useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    console.log("Initializing auth state...");
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session found" : "No session");
      setState({
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setState({
        session,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, []);

  return state;
};
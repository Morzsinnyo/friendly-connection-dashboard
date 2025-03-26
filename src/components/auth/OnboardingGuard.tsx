
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLoadingState } from "./AuthLoadingState";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not authenticated, redirect to auth page
          navigate("/auth", { replace: true });
          return;
        }
        
        // Check if user has completed onboarding
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("[OnboardingGuard] Error checking onboarding status:", error);
          // If there's an error, we'll let the user proceed to avoid blocking them
          setHasCompletedOnboarding(true);
          setIsLoading(false);
          return;
        }
        
        setHasCompletedOnboarding(data.onboarded);
        setIsLoading(false);
        
        // Redirect to onboarding if not completed
        if (!data.onboarded) {
          console.log("[OnboardingGuard] User has not completed onboarding, redirecting");
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error("[OnboardingGuard] Error:", error);
        setIsLoading(false);
      }
    };
    
    checkOnboardingStatus();
  }, [navigate]);
  
  if (isLoading) {
    return <AuthLoadingState message="Checking onboarding status..." />;
  }
  
  if (!hasCompletedOnboarding) {
    return null;
  }
  
  return <>{children}</>;
}

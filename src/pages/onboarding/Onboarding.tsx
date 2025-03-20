
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { OnboardingWelcome } from "./steps/OnboardingWelcome";
import { OnboardingContacts } from "./steps/OnboardingContacts";
import { OnboardingCalendar } from "./steps/OnboardingCalendar";
import { OnboardingReminders } from "./steps/OnboardingReminders";
import { OnboardingComplete } from "./steps/OnboardingComplete";
import { Progress } from "@/components/ui/progress";

export type OnboardingStep = "welcome" | "contacts" | "calendar" | "reminders" | "complete";

export default function Onboarding() {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  
  const steps: OnboardingStep[] = ["welcome", "contacts", "calendar", "reminders", "complete"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;
  
  // Check location state for step information when component mounts or location changes
  useEffect(() => {
    const locationState = location.state as { currentStep?: OnboardingStep } | null;
    if (locationState && locationState.currentStep) {
      setCurrentStep(locationState.currentStep);
    } else {
      // Also check sessionStorage as a fallback
      const savedStep = sessionStorage.getItem('onboardingStep') as OnboardingStep | null;
      if (savedStep && steps.includes(savedStep)) {
        setCurrentStep(savedStep);
      }
    }
  }, [location]);
  
  // Save current step to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('onboardingStep', currentStep);
  }, [currentStep]);
  
  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };
  
  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsCompleting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to complete onboarding");
        return;
      }

      // Update the profile to mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success("Onboarding completed! Welcome to the app.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <OnboardingWelcome onNext={handleNext} />;
      case "contacts":
        return <OnboardingContacts onNext={handleNext} onBack={handleBack} />;
      case "calendar":
        return <OnboardingCalendar onNext={handleNext} onBack={handleBack} />;
      case "reminders":
        return <OnboardingReminders onNext={handleNext} onBack={handleBack} />;
      case "complete":
        return <OnboardingComplete onComplete={completeOnboarding} isCompleting={isCompleting} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <header className="border-b bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#071A52]">LinkUp</h1>
          <Button 
            variant="link"
            onClick={completeOnboarding}
            disabled={isCompleting}
          >
            Skip onboarding
          </Button>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Getting Started</span>
            <span>Complete</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

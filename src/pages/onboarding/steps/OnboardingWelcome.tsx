
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-primary/10 p-4 rounded-full">
          <Rocket className="h-16 w-16 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold">Welcome to Friendly Connection!</h2>
      
      <p className="text-muted-foreground text-lg">
        Let's get you set up with everything you need to stay connected with the people who matter most to you.
      </p>
      
      <div className="space-y-4 mt-4">
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium">Here's what we'll cover:</h3>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>Setting up your contacts</li>
            <li>Connecting your calendar</li>
            <li>Creating your first reminder</li>
          </ul>
        </div>
        
        <p className="text-sm text-muted-foreground">
          This should only take about 2 minutes to complete.
        </p>
      </div>
      
      <Button onClick={onNext} size="lg" className="mt-6">
        Let's get started
      </Button>
    </div>
  );
}

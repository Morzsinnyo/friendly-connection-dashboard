
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface OnboardingCompleteProps {
  onComplete: () => void;
  isCompleting: boolean;
}

export function OnboardingComplete({ onComplete, isCompleting }: OnboardingCompleteProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold">You're all set!</h2>
      
      <p className="text-muted-foreground text-lg">
        You've successfully completed the onboarding process. You're now ready to start using Friendly Connection to strengthen your relationships.
      </p>
      
      <div className="bg-muted p-4 rounded-md text-left">
        <h3 className="font-medium">What you can do now:</h3>
        <ul className="list-disc list-inside mt-2 text-muted-foreground">
          <li>Add more contacts or import from other sources</li>
          <li>Set up reminders for specific contacts</li>
          <li>Record notes from your conversations</li>
          <li>Track your relationship progress</li>
        </ul>
      </div>
      
      <Button 
        onClick={onComplete} 
        size="lg" 
        className="mt-6"
        disabled={isCompleting}
      >
        {isCompleting ? "Completing..." : "Go to Dashboard"}
      </Button>
    </div>
  );
}

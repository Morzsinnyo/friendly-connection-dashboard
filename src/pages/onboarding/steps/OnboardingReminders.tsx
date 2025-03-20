
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { useState } from "react";

interface OnboardingRemindersProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingReminders({ onNext, onBack }: OnboardingRemindersProps) {
  const [reminderFrequency, setReminderFrequency] = useState<string>("monthly");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Clock className="h-12 w-12 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold">Set default reminder preferences</h2>
        <p className="text-muted-foreground">
          Choose how often you'd like to be reminded to check in with your contacts.
        </p>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <RadioGroup 
              value={reminderFrequency} 
              onValueChange={setReminderFrequency}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="cursor-pointer">Every week</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="biweekly" id="biweekly" />
                <Label htmlFor="biweekly" className="cursor-pointer">Every 2 weeks</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label htmlFor="quarterly" className="cursor-pointer">Every 3 months</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        <p className="text-sm text-muted-foreground">
          Don't worry, you can set different frequencies for individual contacts later.
        </p>
      </div>
      
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}

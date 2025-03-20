
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/contacts/useUserProfile";

interface OnboardingCalendarProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingCalendar({ onNext, onBack }: OnboardingCalendarProps) {
  const { data: profile, refetch } = useUserProfile();
  const [calendarId, setCalendarId] = useState(profile?.calendar_id || "");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateCalendarId = async () => {
    try {
      setIsUpdating(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to update calendar settings");
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ calendar_id: calendarId })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refetch();
      toast.success("Calendar ID updated successfully");
      onNext();
    } catch (error) {
      console.error("Error updating calendar ID:", error);
      toast.error("Failed to update calendar ID");
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <CalendarCheck className="h-12 w-12 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold">Connect your calendar</h2>
        <p className="text-muted-foreground">
          Connect your Google Calendar to schedule reminders and meetings.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="calendarId">Google Calendar ID</Label>
          <Input
            id="calendarId"
            placeholder="example@gmail.com"
            value={calendarId}
            onChange={(e) => setCalendarId(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter your Google Calendar ID. Typically, this is your Gmail address.
          </p>
        </div>
        
        <div className="bg-muted p-4 rounded-md text-sm space-y-2">
          <p className="font-medium">How to find your Calendar ID:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Open <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Calendar</a></li>
            <li>Click on the settings gear icon in the top right</li>
            <li>Select "Settings"</li>
            <li>Click on the calendar you want to use under "Settings for my calendars"</li>
            <li>Scroll down to "Integrate calendar" section</li>
            <li>Find your Calendar ID under "Calendar ID"</li>
          </ol>
        </div>
      </div>
      
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={updateCalendarId} 
          disabled={isUpdating || !calendarId}
        >
          {isUpdating ? "Updating..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}

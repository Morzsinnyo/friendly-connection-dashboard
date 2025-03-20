
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, Copy, Calendar } from "lucide-react";
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
  const serviceAccountEmail = "calendar-integration@aesthetic-genre-447912-m8.iam.gserviceaccount.com";
  
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

  const handleCopy = () => {
    navigator.clipboard.writeText(serviceAccountEmail);
    toast.success("Service account email copied to clipboard");
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
      
      {/* Loom Video Tutorial */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Watch the tutorial</h3>
        <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
          <iframe 
            src="https://www.loom.com/embed/703b30411d7a4aa39ea288f3e8fea4cf?sid=e05812a0-bb94-487f-b540-7d7301f458ef" 
            frameBorder="0" 
            allowFullScreen 
            className="absolute top-0 left-0 w-full h-full rounded-lg"
          />
        </div>
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
        
        <div className="space-y-2">
          <Label>Service Account Email (Grant access to this email in your Google Calendar)</Label>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
            <p className="text-sm break-all flex-1">{serviceAccountEmail}</p>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
        
        <Button 
          variant="default" 
          size="sm" 
          className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
          onClick={() => window.open('https://calendar.google.com/', '_blank')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Google Calendar
        </Button>
        
        <div className="bg-muted p-4 rounded-md text-sm space-y-2">
          <p className="font-medium">How to connect your Google Calendar:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Open Google Calendar using the button above</li>
            <li>Copy the service account email (click Copy button)</li>
            <li>In Google Calendar, click on settings icon</li>
            <li>Select your calendar under "Settings for my calendars"</li>
            <li>Click "Share with specific people"</li>
            <li>Add the service account email and grant "Make changes to events" permission</li>
            <li>Enter your Calendar ID (usually your Gmail) in the input above</li>
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

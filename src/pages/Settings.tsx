import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Copy, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CalendarSettings } from "@/components/calendar/CalendarSettings";
import { useUserProfile } from "@/hooks/contacts/useUserProfile";
import { useState } from "react";

export default function Settings() {
  const { toast } = useToast();
  const { data: profile, refetch } = useUserProfile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const serviceAccountEmail = "calendar-integration@aesthetic-genre-447912-m8.iam.gserviceaccount.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(serviceAccountEmail);
    toast({
      description: "Service account email copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto space-y-6 max-w-3xl px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks and feels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Select your preferred theme
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tutorial</CardTitle>
          <CardDescription>
            Watch this video to learn how to use the application effectively.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
            <iframe 
              src="https://www.loom.com/embed/7113f12571e14d33b5616615c391dae9?sid=8f424735-4701-405a-9e20-9b9dc52ec960" 
              frameBorder="0" 
              allowFullScreen 
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <p className="text-sm text-muted-foreground break-all flex-1">{serviceAccountEmail}</p>
            <Button variant="outline" size="sm" onClick={handleCopy} className="w-full sm:w-auto">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <CalendarSettings
            calendarId={profile?.calendar_id || null}
            onCalendarIdUpdate={() => refetch()}
            isSettingsOpen={isSettingsOpen}
            onSettingsOpenChange={setIsSettingsOpen}
          />
          <Button 
            variant="default" 
            size="sm" 
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
            onClick={() => window.open('https://calendar.google.com/', '_blank')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Google Calendar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { ContactsList } from "@/components/contacts/ContactsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarSettings } from "@/components/calendar/CalendarSettings";
import { useUserProfile } from "@/hooks/contacts/useUserProfile";

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const navigate = useNavigate();
  const { data: profile, refetch } = useUserProfile();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Google Calendar Settings</CardTitle>
            <Button 
              variant="outline"
              onClick={() => navigate("/settings")}
            >
              Tutorial
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CalendarSettings
            calendarId={profile?.calendar_id || null}
            onCalendarIdUpdate={() => refetch()}
            isSettingsOpen={isSettingsOpen}
            onSettingsOpenChange={setIsSettingsOpen}
          />
          <p className="text-sm text-muted-foreground">
            Enter your Google Calendar ID to sync events. You can find this in your Google Calendar settings.
          </p>
        </CardContent>
      </Card>

      <ContactsList />
    </div>
  );
};

export default Index;
import { useState, useEffect } from "react";
import { ContactsList } from "@/components/contacts/ContactsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [calendarId, setCalendarId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCalendarId();
  }, []);

  const fetchCalendarId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('calendar_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (profile?.calendar_id) {
        setCalendarId(profile.calendar_id);
      }
    } catch (error) {
      console.error('Error fetching calendar ID:', error);
      toast.error('Failed to fetch calendar settings');
    }
  };

  const updateCalendarId = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ calendar_id: calendarId })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Calendar ID updated successfully');
    } catch (error) {
      console.error('Error updating calendar ID:', error);
      toast.error('Failed to update calendar ID');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="calendarId" className="text-sm font-medium">
              Calendar ID
            </label>
            <div className="flex gap-2">
              <Input
                id="calendarId"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                placeholder="example@gmail.com"
                className="flex-1"
              />
              <Button 
                onClick={updateCalendarId} 
                disabled={isLoading}
              >
                Save
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your Google Calendar ID to sync events. You can find this in your Google Calendar settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <ContactsList />
    </div>
  );
};

export default Index;
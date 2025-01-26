import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalendarSettingsProps {
  calendarId: string | null;
  onCalendarIdUpdate: (id: string) => void;
  isSettingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
}

export const CalendarSettings = ({
  calendarId,
  onCalendarIdUpdate,
  isSettingsOpen,
  onSettingsOpenChange
}: CalendarSettingsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tempCalendarId, setTempCalendarId] = useState(calendarId || '');

  const updateCalendarId = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ calendar_id: tempCalendarId })
        .eq('id', user.id);

      if (error) throw error;

      onCalendarIdUpdate(tempCalendarId);
      toast.success('Calendar ID updated successfully');
      onSettingsOpenChange(false);
    } catch (error) {
      console.error('Error updating calendar ID:', error);
      toast.error('Failed to update calendar ID');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="calendarId">Calendar ID</Label>
        <Input
          id="calendarId"
          value={tempCalendarId}
          onChange={(e) => setTempCalendarId(e.target.value)}
          placeholder="example@gmail.com"
        />
      </div>
      <Button onClick={updateCalendarId} disabled={isLoading}>
        Save Calendar ID
      </Button>
    </div>
  );
};
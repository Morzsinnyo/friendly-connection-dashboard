import { useState } from "react";
import { ReminderStatus } from "./ReminderStatus";
import { RescheduleDialog } from "./RescheduleDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReminderStatusBadgeProps {
  status: 'pending' | 'completed' | 'skipped';
  contactId: string;
  onStatusChange: () => void;
  eventSummary: string;
}

export function ReminderStatusBadge({ 
  status, 
  contactId, 
  onStatusChange,
  eventSummary 
}: ReminderStatusBadgeProps) {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  // Fetch calendar ID when component mounts
  useState(() => {
    fetchCalendarId();
  });

  const fetchCalendarId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('calendar_id')
        .eq('id', user.id)
        .single();

      if (profile?.calendar_id) {
        setCalendarId(profile.calendar_id);
      }
    } catch (error) {
      console.error('Error fetching calendar ID:', error);
    }
  };

  const handleReschedule = async (newDate: Date) => {
    if (!calendarId) {
      toast.error("Calendar ID is required");
      return;
    }

    try {
      console.log('Handling reschedule for contact:', contactId);
      
      // First mark the current reminder as skipped
      const { error: statusError } = await supabase
        .from('contacts')
        .update({ reminder_status: 'skipped' })
        .eq('id', contactId);

      if (statusError) throw statusError;

      // Create new calendar event
      const response = await supabase.functions.invoke('google-calendar', {
        body: {
          action: 'createEvent',
          calendarId,
          eventData: {
            summary: eventSummary,
            start: {
              dateTime: newDate.toISOString(),
              timeZone: 'UTC'
            },
            end: {
              dateTime: new Date(newDate.getTime() + 60 * 60 * 1000).toISOString(),
              timeZone: 'UTC'
            }
          }
        }
      });

      if (response.error) throw response.error;

      // Refresh the events list
      onStatusChange();
    } catch (error) {
      console.error('Error in handleReschedule:', error);
      toast.error("Failed to reschedule reminder");
      throw error;
    }
  };

  return (
    <>
      <ReminderStatus
        contactId={contactId}
        currentStatus={status}
        onStatusChange={onStatusChange}
        onSkip={() => setIsRescheduleOpen(true)}
      />
      <RescheduleDialog
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        eventSummary={eventSummary}
        contactId={contactId}
        calendarId={calendarId || undefined}
        onReschedule={handleReschedule}
      />
    </>
  );
}
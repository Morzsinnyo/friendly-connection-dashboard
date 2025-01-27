import { useState, useEffect } from "react";
import { ReminderStatus } from "./ReminderStatus";
import { RescheduleDialog } from "./RescheduleDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingState } from "@/components/common/LoadingState";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[ReminderStatusBadge] Initializing calendar ID fetch');
    let mounted = true;

    const fetchCalendarId = async () => {
      try {
        console.log('[ReminderStatusBadge] Fetching user data');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) return;

        console.log('[ReminderStatusBadge] Fetching profile data');
        const { data: profile } = await supabase
          .from('profiles')
          .select('calendar_id')
          .eq('id', user.id)
          .single();

        if (mounted) {
          console.log('[ReminderStatusBadge] Setting calendar ID:', profile?.calendar_id);
          setCalendarId(profile?.calendar_id || null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[ReminderStatusBadge] Error fetching calendar ID:', error);
        if (mounted) {
          setIsLoading(false);
          toast.error("Failed to load calendar settings");
        }
      }
    };

    fetchCalendarId();

    return () => {
      console.log('[ReminderStatusBadge] Cleaning up calendar ID fetch');
      mounted = false;
    };
  }, []);

  const handleSkip = async (): Promise<void> => {
    return new Promise((resolve) => {
      setIsRescheduleOpen(true);
      resolve();
    });
  };

  const handleReschedule = async (newDate: Date) => {
    if (!calendarId) {
      toast.error("Calendar ID is required");
      return;
    }

    try {
      console.log('[ReminderStatusBadge] Handling reschedule for contact:', contactId);
      
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
      
      toast.success("Event rescheduled successfully");
      setIsRescheduleOpen(false);
    } catch (error) {
      console.error('[ReminderStatusBadge] Error in handleReschedule:', error);
      toast.error("Failed to reschedule reminder");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading calendar settings..." />;
  }

  return (
    <>
      <ReminderStatus
        contactId={contactId}
        currentStatus={status}
        onStatusChange={onStatusChange}
        onSkip={handleSkip}
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
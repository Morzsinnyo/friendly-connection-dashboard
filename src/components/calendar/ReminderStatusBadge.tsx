import { useState } from "react";
import { ReminderStatus } from "./ReminderStatus";
import { RescheduleDialog } from "./RescheduleDialog";
import { supabase } from "@/integrations/supabase/client";
import { useContactStatus } from "@/hooks/contacts/useContactStatus";

interface ReminderStatusBadgeProps {
  status: 'pending' | 'completed' | 'skipped';
  contactId: string;
  className?: string;
  onStatusChange?: () => void;
  eventSummary?: string;
}

export function ReminderStatusBadge({ 
  status, 
  contactId, 
  className, 
  onStatusChange,
  eventSummary = ""
}: ReminderStatusBadgeProps) {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const { updateReminderStatus } = useContactStatus(contactId);

  const handleReschedule = async (newDate: Date) => {
    try {
      // First mark the current reminder as skipped
      await updateReminderStatus('skipped');
      
      // Then create a new reminder for the selected date
      const { error } = await supabase
        .from('contacts')
        .update({ 
          next_reminder: newDate.toISOString(),
          reminder_status: 'pending'
        })
        .eq('id', contactId);

      if (error) throw error;
      
      onStatusChange?.();
    } catch (error) {
      console.error('Error rescheduling reminder:', error);
      throw error;
    }
  };

  const handleSkip = async () => {
    setIsRescheduleOpen(true);
  };

  return (
    <div className={className}>
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
        onReschedule={handleReschedule}
      />
    </div>
  );
}
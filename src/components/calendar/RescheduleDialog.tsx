import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventSummary: string;
  contactId: string;
  calendarId?: string;
  onReschedule: (newDate: Date) => Promise<void>;
}

export function RescheduleDialog({
  isOpen,
  onClose,
  eventSummary,
  contactId,
  calendarId,
  onReschedule,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReschedule = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!calendarId) {
      toast.error("Calendar ID is required. Please check your calendar settings.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Starting reschedule process for contact:', contactId);
      
      // First update the contact's reminder status and next reminder
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          reminder_status: 'pending',
          next_reminder: selectedDate.toISOString()
        })
        .eq('id', contactId);

      if (updateError) throw updateError;

      // Then call the parent's onReschedule handler
      await onReschedule(selectedDate);
      
      toast.success("Event rescheduled successfully");
      onClose();
    } catch (error) {
      console.error('Error in handleReschedule:', error);
      toast.error("Failed to reschedule event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Event</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Rescheduling: {eventSummary}
          </p>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
          {selectedDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected date: {format(selectedDate, "PPP")}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!selectedDate || isSubmitting}
          >
            Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
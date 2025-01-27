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

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventSummary: string;
  contactId: string;
  onReschedule: (newDate: Date) => Promise<void>;
}

export function RescheduleDialog({
  isOpen,
  onClose,
  eventSummary,
  onReschedule,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReschedule = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReschedule(selectedDate);
      toast.success("Event rescheduled successfully");
      onClose();
    } catch (error) {
      console.error("Failed to reschedule event:", error);
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
import { toast } from "sonner";
import { CalendarError, ReminderError, TransitionError } from "@/api/types/errors";

export const handleCalendarError = (error: CalendarError): void => {
  console.error('Calendar operation failed:', error);
  
  const message = error.code === 'CALENDAR_NOT_FOUND' 
    ? 'Calendar not found. Please check your calendar settings.'
    : 'Failed to perform calendar operation. Please try again.';
  
  toast.error(message);
};

export const handleReminderError = (error: ReminderError): void => {
  console.error(`Reminder ${error.type} failed:`, error);
  
  const messages = {
    deletion: 'Failed to remove existing reminders. Please try again.',
    creation: 'Failed to create new reminder. Please try again.',
    search: 'Failed to find existing reminders. Please try again.'
  };
  
  toast.error(messages[error.type]);
};

export const handleTransitionError = (error: TransitionError): void => {
  console.error('State transition failed:', error);
  
  toast.error(`Failed to update reminder: ${error.reason}`);
};

export const isCalendarError = (error: unknown): error is CalendarError => {
  return error instanceof Error && 'code' in error;
};

export const isReminderError = (error: unknown): error is ReminderError => {
  return error instanceof Error && 'type' in error;
};

export const isTransitionError = (error: unknown): error is TransitionError => {
  return error instanceof Error && 'state' in error && 'targetState' in error;
};
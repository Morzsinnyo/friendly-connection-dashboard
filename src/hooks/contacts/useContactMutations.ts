import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addWeeks, addMonths, setHours, setMinutes } from "date-fns";
import { handleCalendarError, handleReminderError, handleTransitionError } from "@/utils/errorHandlers";
import { 
  CalendarError, 
  ReminderError, 
  TransitionError,
  isCalendarError,
  isReminderError,
  isTransitionError 
} from "@/api/types/errors";

const calculateNextReminder = (frequency: string): Date => {
  const today = new Date();
  const lunchTime = setMinutes(setHours(today, 12), 0);
  
  switch (frequency) {
    case 'Every week':
      return addWeeks(lunchTime, 1);
    case 'Every 2 weeks':
      return addWeeks(lunchTime, 2);
    case 'Monthly':
      return addMonths(lunchTime, 1);
    default:
      return lunchTime;
  }
};

export const useContactMutations = (contactId: string) => {
  const queryClient = useQueryClient();

  const updateFollowupMutation = useMutation({
    mutationFn: async (date: Date) => {
      const { error } = await supabase
        .from('contacts')
        .update({ scheduled_followup: date.toISOString() })
        .eq('id', contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Follow-up scheduled successfully');
    },
    onError: (error) => {
      console.error('Error scheduling follow-up:', error);
      toast.error('Failed to schedule follow-up');
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ reminderFrequency, calendarId, contactName }: { 
      reminderFrequency: string; 
      calendarId: string;
      contactName: string;
    }) => {
      try {
        console.log('Setting reminder frequency:', reminderFrequency);
        console.log('Contact name:', contactName);
        
        if (!calendarId) {
          const error = new Error('Please set up your calendar ID in the calendar settings first') as CalendarError;
          error.code = 'CALENDAR_NOT_FOUND';
          throw error;
        }

        // First try to remove existing reminders
        try {
          const deleteResponse = await supabase.functions.invoke('google-calendar', {
            body: {
              action: 'deleteExistingReminders',
              calendarId,
              contactName
            }
          });

          if (deleteResponse.error) {
            const error = new Error('Failed to remove existing reminders') as ReminderError;
            error.type = 'deletion';
            error.originalError = deleteResponse.error;
            throw error;
          }

          console.log('Successfully removed existing reminders');
        } catch (error) {
          handleReminderError(error as ReminderError);
          throw error;
        }

        // Calculate next reminder time
        const nextReminder = calculateNextReminder(reminderFrequency);
        const endTime = new Date(nextReminder.getTime() + 60 * 60 * 1000);

        // Update database
        const { error: dbError } = await supabase
          .from('contacts')
          .update({ 
            reminder_frequency: reminderFrequency,
            next_reminder: nextReminder.toISOString()
          })
          .eq('id', contactId);
        
        if (dbError) {
          const error = new Error('Failed to update reminder in database') as TransitionError;
          error.state = 'current';
          error.targetState = 'updated';
          error.reason = dbError.message;
          throw error;
        }

        // Create new calendar event
        const eventData = {
          summary: `Time to contact ${contactName}`,
          description: `Recurring reminder to keep in touch with ${contactName}`,
          start: {
            dateTime: nextReminder.toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'UTC'
          },
          frequency: reminderFrequency,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 1440 },
              { method: 'email', minutes: 1440 }
            ]
          }
        };

        console.log('Creating calendar event with data:', eventData);

        const response = await supabase.functions.invoke('google-calendar', {
          body: {
            action: 'createEvent',
            eventData,
            calendarId
          }
        });

        if (response.error) {
          const error = new Error('Failed to create calendar event') as ReminderError;
          error.type = 'creation';
          error.originalError = response.error;
          throw error;
        }

        console.log('Calendar event created successfully:', response.data);
      } catch (error) {
        if (isCalendarError(error)) {
          handleCalendarError(error);
        } else if (isReminderError(error)) {
          handleReminderError(error);
        } else if (isTransitionError(error)) {
          handleTransitionError(error);
        } else {
          console.error('Unknown error:', error);
          toast.error('An unexpected error occurred');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Reminder frequency updated and calendar event created');
    },
    onError: (error) => {
      console.error('Error updating reminder frequency:', error);
    },
  });

  const updateGiftIdeasMutation = useMutation({
    mutationFn: async (newGiftIdeas: string[]) => {
      console.log('Updating gift ideas:', newGiftIdeas);
      const { error } = await supabase
        .from('contacts')
        .update({ gift_ideas: newGiftIdeas })
        .eq('id', contactId);
      
      if (error) {
        console.error('Error updating gift ideas:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Gift idea added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add gift idea');
      console.error('Error updating gift ideas:', error);
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      console.log('Updating notes for contact:', contactId, notes);
      const { error } = await supabase
        .from('contacts')
        .update({ notes })
        .eq('id', contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
    },
    onError: (error) => {
      console.error('Error updating notes:', error);
    },
  });

  return {
    updateFollowupMutation,
    updateReminderMutation,
    updateGiftIdeasMutation,
    updateNotesMutation,
  };
};

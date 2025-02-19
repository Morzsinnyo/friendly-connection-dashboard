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
import { Json } from "@/integrations/supabase/types";
import { calculateNextReminder } from "@/api/services/contacts/mutations/reminderMutations";

type ReminderFrequency = 'Every week' | 'Every 2 weeks' | 'Monthly' | 'Every 2 months' | 'Every 3 months' | null;
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type ReminderMutationParams = {
  reminderFrequency: ReminderFrequency;
  calendarId: string;
  contactName: string;
  preferredDay?: DayOfWeek;
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
    mutationFn: async ({ reminderFrequency, calendarId, contactName, preferredDay }: ReminderMutationParams) => {
      try {
        console.log('Setting reminder:', { reminderFrequency, calendarId, contactName, preferredDay });
        
        if (!calendarId) {
          const error = new Error('Please set up your calendar ID in the calendar settings first') as CalendarError;
          error.code = 'CALENDAR_NOT_FOUND';
          throw error;
        }

        // Calculate next reminder time based on frequency and preferred day
        const nextReminder = reminderFrequency ? calculateNextReminder(reminderFrequency, preferredDay) : null;

        // Update database
        const { error: dbError } = await supabase
          .from('contacts')
          .update({ 
            reminder_frequency: reminderFrequency,
            next_reminder: nextReminder?.toISOString() || null,
            preferred_reminder_day: preferredDay
          })
          .eq('id', contactId);
        
        if (dbError) {
          const error = new Error('Failed to update reminder in database') as TransitionError;
          error.state = 'current';
          error.targetState = 'updated';
          error.reason = dbError.message;
          throw error;
        }

        if (reminderFrequency && nextReminder) {
          // Create new calendar event
          const endTime = new Date(nextReminder.getTime() + 60 * 60 * 1000);
          const eventData = {
            summary: `${contactName} - It's time to contact`,
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
            preferredDay,
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
        }
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
      toast.success('Reminder updated successfully');
    },
    onError: (error) => {
      console.error('Error updating reminder:', error);
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
    mutationFn: async (notes: Json[]) => {
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

  const updateBirthdayMutation = useMutation({
    mutationFn: async (birthday: string | null) => {
      console.log('Updating birthday:', birthday, 'for contact:', contactId);
      const { error } = await supabase
        .from('contacts')
        .update({ birthday })
        .eq('id', contactId);
      
      if (error) {
        console.error('Error updating birthday:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Birthday updated successfully');
    },
    onError: (error) => {
      console.error('Error updating birthday:', error);
      toast.error('Failed to update birthday');
    },
  });

  return {
    updateFollowupMutation,
    updateReminderMutation,
    updateGiftIdeasMutation,
    updateNotesMutation,
    updateBirthdayMutation,
  };
};

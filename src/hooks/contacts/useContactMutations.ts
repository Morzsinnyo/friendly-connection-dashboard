import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addWeeks, addMonths, setHours, setMinutes } from "date-fns";

const calculateNextReminder = (frequency: string): Date => {
  const today = new Date();
  // Set to 12:00 PM
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

const getRecurrenceRule = (frequency: string): string => {
  switch (frequency) {
    case 'Every week':
      return 'FREQ=WEEKLY';
    case 'Every 2 weeks':
      return 'FREQ=WEEKLY;INTERVAL=2';
    case 'Monthly':
      return 'FREQ=MONTHLY';
    default:
      return '';
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
      toast.error('Failed to schedule follow-up');
      console.error('Error scheduling follow-up:', error);
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ reminderFrequency, calendarId, contactName }: { 
      reminderFrequency: string; 
      calendarId: string;
      contactName: string;
    }) => {
      console.log('Setting reminder frequency:', reminderFrequency);
      console.log('Contact name:', contactName);
      
      if (!calendarId) {
        throw new Error('Please set up your calendar ID in the calendar settings first');
      }

      const nextReminder = calculateNextReminder(reminderFrequency);
      const endTime = new Date(nextReminder.getTime() + 60 * 60 * 1000); // Add 1 hour

      const { error } = await supabase
        .from('contacts')
        .update({ 
          reminder_frequency: reminderFrequency,
          next_reminder: nextReminder.toISOString()
        })
        .eq('id', contactId);
      
      if (error) throw error;

      console.log('Creating calendar event with data:', {
        summary: `Time to contact ${contactName}`,
        start: nextReminder,
        end: endTime,
        recurrence: getRecurrenceRule(reminderFrequency)
      });

      const response = await supabase.functions.invoke('google-calendar', {
        body: {
          action: 'createEvent',
          eventData: {
            summary: `Time to contact ${contactName}`,
            start: {
              dateTime: nextReminder.toISOString(),
            },
            end: {
              dateTime: endTime.toISOString(),
            },
            recurrence: [
              `RRULE:${getRecurrenceRule(reminderFrequency)}`
            ]
          },
          calendarId
        }
      });

      if (response.error) {
        console.error('Error creating calendar event:', response.error);
        throw new Error('Failed to create calendar event');
      }

      console.log('Calendar event created successfully:', response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Reminder frequency updated and calendar event created');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update reminder frequency');
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

  return {
    updateFollowupMutation,
    updateReminderMutation,
    updateGiftIdeasMutation
  };
};
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addWeeks, addMonths } from "date-fns";

const calculateNextReminder = (frequency: string): Date => {
  const today = new Date();
  switch (frequency) {
    case 'Every week':
      return addWeeks(today, 1);
    case 'Every 2 weeks':
      return addWeeks(today, 2);
    case 'Monthly':
      return addMonths(today, 1);
    default:
      return today;
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
    mutationFn: async ({ reminderFrequency, calendarId }: { reminderFrequency: string; calendarId: string }) => {
      console.log('Setting reminder frequency:', reminderFrequency);
      
      if (!calendarId) {
        throw new Error('Please set up your calendar ID in the calendar settings first');
      }

      const nextReminder = calculateNextReminder(reminderFrequency);
      const { error } = await supabase
        .from('contacts')
        .update({ 
          reminder_frequency: reminderFrequency,
          next_reminder: nextReminder.toISOString()
        })
        .eq('id', contactId);
      
      if (error) throw error;

      const response = await supabase.functions.invoke('google-calendar', {
        body: {
          action: 'createEvent',
          eventData: {
            'summary': `Time to contact ${contactId}`,
            'start': {
              'dateTime': nextReminder.toISOString(),
            },
            'end': {
              'dateTime': new Date(nextReminder.getTime() + 30 * 60000).toISOString(),
            },
            'recurrence': [
              `RRULE:FREQ=${reminderFrequency === 'Every week' ? 'WEEKLY' : 
                reminderFrequency === 'Every 2 weeks' ? 'WEEKLY;INTERVAL=2' : 'MONTHLY'}`
            ],
            'reminders': {
              'useDefault': false,
              'overrides': [
                {'method': 'popup', 'minutes': 1440},
                {'method': 'email', 'minutes': 1440}
              ]
            }
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
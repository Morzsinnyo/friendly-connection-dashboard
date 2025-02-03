import { Contact } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";
import { supabase } from "@/integrations/supabase/client";
import { addWeeks, addMonths, setHours, setMinutes } from "date-fns";

export const calculateNextReminder = (frequency: string, currentDate: Date = new Date()): Date => {
  // First set the time to 12:00 PM
  let nextDate = setHours(setMinutes(currentDate, 0), 12);
  
  switch (frequency) {
    case 'Every week':
      return addWeeks(nextDate, 1);
    case 'Every 2 weeks':
      return addWeeks(nextDate, 2);
    case 'Monthly':
      return addMonths(nextDate, 1);
    case 'Every 2 months':
      return addMonths(nextDate, 2);
    case 'Every 3 months':
      return addMonths(nextDate, 3);
    default:
      return nextDate;
  }
};

export const reminderMutations = {
  updateReminder: async (
    id: string, 
    frequency: string | null, 
    nextReminder: Date | null,
    calendarId?: string,
    contactName?: string
  ): Promise<ApiResponse<Contact>> => {
    console.log('Updating reminder for contact:', { id, frequency, nextReminder, calendarId, contactName });
    
    if (!frequency || !nextReminder) {
      console.log('Removing reminder for contact:', id);
      
      if (calendarId && contactName) {
        console.log('Attempting to remove calendar events');
        try {
          const response = await supabase.functions.invoke('google-calendar', {
            body: {
              action: 'deleteExistingReminders',
              calendarId,
              contactName
            }
          });
          console.log('Calendar events removal response:', response);
        } catch (error) {
          console.error('Failed to remove calendar events:', error);
        }
      }

      const query = Promise.resolve(
        supabase
          .from('contacts')
          .update({
            reminder_frequency: null,
            next_reminder: null,
            reminder_status: 'pending'
          })
          .eq('id', id)
          .select()
          .single()
      );

      return formatApiResponse(query);
    }

    console.log('Setting new reminder:', { frequency, nextReminder });
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .update({
          reminder_frequency: frequency,
          next_reminder: nextReminder.toISOString(),
          reminder_status: 'pending'
        })
        .eq('id', id)
        .select()
        .single()
    );

    const updateResult = await formatApiResponse(query);

    if (!updateResult.error && calendarId && contactName) {
      console.log('Creating calendar event for reminder');
      try {
        const endTime = new Date(nextReminder.getTime() + 60 * 60 * 1000);
        
        const response = await supabase.functions.invoke('google-calendar', {
          body: {
            action: 'createEvent',
            calendarId,
            eventData: {
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
              frequency,
              reminders: {
                useDefault: false,
                overrides: [
                  { method: 'popup', minutes: 1440 },
                  { method: 'email', minutes: 1440 }
                ]
              }
            }
          }
        });
        console.log('Calendar event creation response:', response);
      } catch (error) {
        console.error('Failed to create calendar event:', error);
      }
    }

    return updateResult;
  },

  updateReminderStatus: async (
    id: string,
    status: 'pending' | 'completed' | 'skipped'
  ): Promise<ApiResponse<Contact>> => {
    console.log('Updating reminder status:', { id, status });
    
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('reminder_frequency, next_reminder')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching contact:', fetchError);
      throw fetchError;
    }

    // Define the type for the updates object
    type ContactUpdates = {
      reminder_status: 'pending' | 'completed' | 'skipped';
      next_reminder?: string;
      last_contact?: string;
    };

    const updates: ContactUpdates = {
      reminder_status: status
    };

    if (status === 'completed' && contact.reminder_frequency) {
      const nextReminder = calculateNextReminder(
        contact.reminder_frequency,
        contact.next_reminder ? new Date(contact.next_reminder) : new Date()
      );
      updates.next_reminder = nextReminder.toISOString();
      updates.last_contact = new Date().toISOString();
    }

    const query = Promise.resolve(
      supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );

    return formatApiResponse(query);
  }
};
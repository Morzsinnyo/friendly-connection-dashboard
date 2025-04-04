
import { Contact } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";
import { supabase } from "@/integrations/supabase/client";
import { addWeeks, addMonths, setHours, setMinutes, format, setDay } from "date-fns";

export const calculateNextReminder = (frequency: string, preferredDay?: number, currentDate: Date = new Date()): Date => {
  // First set the time to 12:00 PM
  let nextDate = setHours(setMinutes(currentDate, 0), 12);
  
  // If a preferred day is set, adjust to the next occurrence of that day
  if (typeof preferredDay === 'number') {
    const currentDay = nextDate.getDay();
    if (currentDay !== preferredDay) {
      // Calculate days to add to reach the preferred day
      let daysToAdd = preferredDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7; // If we've passed the preferred day this week, go to next week
      nextDate = addWeeks(nextDate, 0); // Create a new date object
      nextDate = setDay(nextDate, preferredDay);
    }
  }

  switch (frequency) {
    case 'Every week':
      return nextDate;
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

const getLatestNote = (notes: any): { content: string; timestamp: string } | null => {
  console.log('[getLatestNote] Processing notes:', notes);
  
  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    console.log('[getLatestNote] No notes found');
    return null;
  }
  
  // Sort by timestamp (newest first)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  console.log('[getLatestNote] Latest note:', sortedNotes[0]);
  
  return {
    content: sortedNotes[0].content,
    timestamp: sortedNotes[0].timestamp
  };
};

export const reminderMutations = {
  updateReminder: async (
    id: string, 
    frequency: string | null, 
    nextReminder: Date | null,
    calendarId?: string,
    contactName?: string,
    preferredDay?: number
  ): Promise<ApiResponse<Contact>> => {
    console.log('Updating reminder for contact:', { id, frequency, nextReminder, calendarId, contactName, preferredDay });
    
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
            reminder_status: 'pending',
            preferred_reminder_day: null
          })
          .eq('id', id)
          .select()
          .single()
      );

      return formatApiResponse(query);
    }

    console.log('Setting new reminder:', { frequency, nextReminder, preferredDay });
    
    // Fetch contact details including notes
    const { data: contact, error: fetchError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching contact:', fetchError);
      throw fetchError;
    }

    console.log('Fetched contact data:', contact);

    const query = Promise.resolve(
      supabase
        .from('contacts')
        .update({
          reminder_frequency: frequency,
          next_reminder: nextReminder.toISOString(),
          reminder_status: 'pending',
          preferred_reminder_day: preferredDay
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
        const latestNote = getLatestNote(contact.notes);
        console.log('Latest note for calendar event:', latestNote);
        
        let description = `Recurring reminder to keep in touch with ${contactName}\n\n`;
        if (latestNote) {
          const formattedDate = format(new Date(latestNote.timestamp), 'MMM d, yyyy');
          description += `Latest Note (${formattedDate}):\n${latestNote.content}`;
        }
        
        console.log('Calendar event description before API call:', description);
        
        const eventData = {
          summary: `Time to contact ${contactName}`,
          description,
          start: {
            dateTime: nextReminder.toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'UTC'
          },
          frequency,
          preferredDay,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 1440 },
              { method: 'email', minutes: 1440 }
            ]
          }
        };

        console.log('Full event data being sent to calendar API:', JSON.stringify(eventData, null, 2));
        
        const response = await supabase.functions.invoke('google-calendar', {
          body: {
            action: 'createEvent',
            calendarId,
            eventData
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
      .select('reminder_frequency, next_reminder, preferred_reminder_day')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching contact:', fetchError);
      throw fetchError;
    }

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
        contact.preferred_reminder_day,
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

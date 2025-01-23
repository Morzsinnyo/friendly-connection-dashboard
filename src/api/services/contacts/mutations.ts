import { supabase } from "@/integrations/supabase/client";
import { Contact, ContactInsert, ContactUpdate } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";

export const contactMutations = {
  create: async (contact: ContactInsert): Promise<ApiResponse<Contact>> => {
    console.log('Creating new contact:', contact);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single()
    );

    return formatApiResponse(query);
  },

  update: async (id: string, updates: ContactUpdate): Promise<ApiResponse<Contact>> => {
    console.log('Updating contact:', id, updates);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );

    return formatApiResponse(query);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    console.log('Deleting contact:', id);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .delete()
        .eq('id', id)
    );

    return formatApiResponse(query);
  },

  updateFollowup: async (id: string, date: Date): Promise<ApiResponse<Contact>> => {
    console.log('Updating followup for contact:', id, date);
    
    return contactMutations.update(id, {
      scheduled_followup: date.toISOString()
    });
  },

  updateReminder: async (
    id: string, 
    frequency: string | null, 
    nextReminder: Date | null,
    calendarId?: string,
    contactName?: string
  ): Promise<ApiResponse<Contact>> => {
    console.log('Updating reminder for contact:', { id, frequency, nextReminder, calendarId, contactName });
    
    // If frequency is null, we're removing the reminder
    if (!frequency || !nextReminder) {
      console.log('Removing reminder for contact:', id);
      
      // If we have a calendar ID, try to remove existing calendar events
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
          // Continue with database update even if calendar removal fails
        }
      }

      return contactMutations.update(id, {
        reminder_frequency: null,
        next_reminder: null
      });
    }

    // We're setting or updating a reminder
    console.log('Setting new reminder:', { frequency, nextReminder });
    
    // First update the database
    const updateResult = await contactMutations.update(id, {
      reminder_frequency: frequency,
      next_reminder: nextReminder.toISOString()
    });

    // If database update successful and we have calendar info, create calendar event
    if (!updateResult.error && calendarId && contactName) {
      console.log('Creating calendar event for reminder');
      try {
        const endTime = new Date(nextReminder.getTime() + 60 * 60 * 1000); // Add 1 hour
        
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
                  { method: 'popup', minutes: 1440 }, // 24 hours before
                  { method: 'email', minutes: 1440 }  // 24 hours before
                ]
              }
            }
          }
        });
        console.log('Calendar event creation response:', response);
      } catch (error) {
        console.error('Failed to create calendar event:', error);
        // Return the database update result even if calendar creation fails
      }
    }

    return updateResult;
  },

  updateGiftIdeas: async (id: string, giftIdeas: string[]): Promise<ApiResponse<Contact>> => {
    console.log('Updating gift ideas for contact:', id, giftIdeas);
    
    return contactMutations.update(id, {
      gift_ideas: giftIdeas
    });
  },

  updateFriendshipScore: async (id: string, score: number): Promise<ApiResponse<Contact>> => {
    console.log('Updating friendship score for contact:', id, score);
    
    return contactMutations.update(id, {
      friendship_score: score
    });
  },

  updateTags: async (id: string, tags: string[]): Promise<ApiResponse<Contact>> => {
    console.log('Updating tags for contact:', id, tags);
    
    return contactMutations.update(id, {
      tags: tags
    });
  }
};
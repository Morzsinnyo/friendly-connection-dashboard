import { supabase } from "@/integrations/supabase/client";
import { Contact, ContactInsert, ContactUpdate, CustomRecurrence } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";
import { addWeeks, addMonths, addDays, addYears } from "date-fns";

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

  updateRelatedContacts: async (
    contactAId: string,
    contactBId: string,
    isAdding: boolean
  ): Promise<ApiResponse<Contact>> => {
    console.log('Updating related contacts:', { contactAId, contactBId, isAdding });
    
    // Get both contacts' current related_contacts arrays
    const { data: contacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id, related_contacts')
      .in('id', [contactAId, contactBId]);
    
    if (fetchError) {
      console.error('Error fetching contacts:', fetchError);
      throw fetchError;
    }

    const contactA = contacts?.find(c => c.id === contactAId);
    const contactB = contacts?.find(c => c.id === contactBId);

    if (!contactA || !contactB) {
      console.error('One or both contacts not found');
      throw new Error('Contacts not found');
    }

    // Update arrays based on whether we're adding or removing
    const contactARelated = contactA.related_contacts || [];
    const contactBRelated = contactB.related_contacts || [];

    const newContactARelated = isAdding
      ? [...new Set([...contactARelated, contactBId])]
      : contactARelated.filter(id => id !== contactBId);

    const newContactBRelated = isAdding
      ? [...new Set([...contactBRelated, contactAId])]
      : contactBRelated.filter(id => id !== contactAId);

    // Update both contacts separately
    const { error: updateErrorA } = await supabase
      .from('contacts')
      .update({ related_contacts: newContactARelated })
      .eq('id', contactAId);

    if (updateErrorA) {
      console.error('Error updating contact A:', updateErrorA);
      throw updateErrorA;
    }

    const { error: updateErrorB } = await supabase
      .from('contacts')
      .update({ related_contacts: newContactBRelated })
      .eq('id', contactBId);

    if (updateErrorB) {
      console.error('Error updating contact B:', updateErrorB);
      throw updateErrorB;
    }

    // Return updated contact A
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .select()
        .eq('id', contactAId)
        .single()
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
    contactName?: string,
    customRecurrence?: CustomRecurrence
  ): Promise<ApiResponse<Contact>> => {
    console.log('Updating reminder for contact:', { 
      id, 
      frequency, 
      nextReminder, 
      calendarId, 
      contactName,
      customRecurrence 
    });
    
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
        next_reminder: null,
        reminder_status: 'pending',
        custom_recurrence_interval: null,
        custom_recurrence_unit: null,
        custom_recurrence_ends: null,
        custom_recurrence_end_date: null,
        custom_recurrence_occurrences: null
      });
    }

    // We're setting or updating a reminder
    console.log('Setting new reminder:', { frequency, nextReminder, customRecurrence });
    
    // Prepare the update object
    const updates: ContactUpdate = {
      reminder_frequency: frequency,
      next_reminder: nextReminder.toISOString(),
      reminder_status: 'pending'
    };

    // Add custom recurrence fields if present
    if (customRecurrence) {
      updates.custom_recurrence_interval = customRecurrence.interval;
      updates.custom_recurrence_unit = customRecurrence.unit;
      updates.custom_recurrence_ends = customRecurrence.ends;
      updates.custom_recurrence_end_date = customRecurrence.endDate;
      updates.custom_recurrence_occurrences = customRecurrence.occurrences;
    }

    // First update the database
    const updateResult = await contactMutations.update(id, updates);

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
              customRecurrence,
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
  },

  // Updated functions for managing reminder statuses
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

    const updates: ContactUpdate = {
      reminder_status: status
    };

    // If completing the reminder, calculate and set next reminder date
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
  },

  skipReminder: async (id: string): Promise<ApiResponse<Contact>> => {
    console.log('Skipping reminder for contact:', id);
    return contactMutations.updateReminderStatus(id, 'skipped');
  },

  completeReminder: async (id: string): Promise<ApiResponse<Contact>> => {
    console.log('Completing reminder for contact:', id);
    return contactMutations.updateReminderStatus(id, 'completed');
  },

  resetReminderStatus: async (id: string): Promise<ApiResponse<Contact>> => {
    console.log('Resetting reminder status for contact:', id);
    return contactMutations.updateReminderStatus(id, 'pending');
  },

  updateLastContact: async (id: string, date?: Date): Promise<ApiResponse<Contact>> => {
    console.log('Updating last contact date:', { id, date });
    
    const lastContact = date ? date.toISOString() : new Date().toISOString();
    
    return contactMutations.update(id, {
      last_contact: lastContact
    });
  }
};

const calculateNextReminder = (frequency: string, currentDate: Date = new Date()): Date => {
  switch (frequency) {
    case 'Every week':
      return addWeeks(currentDate, 1);
    case 'Every 2 weeks':
      return addWeeks(currentDate, 2);
    case 'Monthly':
      return addMonths(currentDate, 1);
    case 'Custom':
      // Custom recurrence is handled separately through the customRecurrence object
      return currentDate;
    default:
      return currentDate;
  }
};
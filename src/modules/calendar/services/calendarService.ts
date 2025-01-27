import { supabase } from "@/integrations/supabase/client";

export const calendarService = {
  createEvent: async (calendarId: string, eventData: any) => {
    console.log('Creating event:', { calendarId, eventData });
    return supabase.functions.invoke('google-calendar', {
      body: { action: 'createEvent', eventData, calendarId }
    });
  },

  deleteEvent: async (calendarId: string, eventId: string) => {
    console.log('Deleting event:', { calendarId, eventId });
    return supabase.functions.invoke('google-calendar', {
      body: { action: 'deleteEvent', calendarId, eventData: { id: eventId } }
    });
  },

  listEvents: async (calendarId: string) => {
    console.log('Listing events for calendar:', calendarId);
    return supabase.functions.invoke('google-calendar', {
      body: { action: 'listEvents', calendarId }
    });
  }
};
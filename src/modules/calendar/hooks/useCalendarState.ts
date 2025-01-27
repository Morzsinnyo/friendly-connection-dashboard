import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarEvent } from '@/api/types/calendar';

export const useCalendarState = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const extractContactInfo = (summary: string) => {
    const contactMatch = summary.toLowerCase().match(/(.+?)(?:\s*-\s*it's time to contact|time to contact\s*)/i);
    return contactMatch ? contactMatch[1].trim() : null;
  };

  const filterNextEventPerContact = async (events: CalendarEvent[]) => {
    const contactEventsMap = new Map<string, CalendarEvent>();
    
    for (const event of events) {
      const contactName = extractContactInfo(event.summary);
      
      if (contactName) {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id, reminder_status')
          .ilike('full_name', contactName)
          .single();

        if (contacts) {
          const existingEvent = contactEventsMap.get(contactName);
          
          if (!existingEvent || new Date(event.start.dateTime) < new Date(existingEvent.start.dateTime)) {
            contactEventsMap.set(contactName, {
              ...event,
              contactId: contacts.id,
              reminderStatus: contacts.reminder_status as 'pending' | 'completed' | 'skipped'
            });
          }
        }
      }
    }

    const nonContactEvents = events.filter(event => 
      !extractContactInfo(event.summary)
    );

    return [...contactEventsMap.values(), ...nonContactEvents];
  };

  const fetchEvents = async () => {
    if (!calendarId) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching calendar events...');
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'listEvents', calendarId }
      });

      if (error) throw error;
      
      console.log('Successfully fetched events:', data.items);
      const filteredEvents = await filterNextEventPerContact(data.items || []);
      console.log('Filtered events with contact info:', filteredEvents);
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendarId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('calendar_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (profile?.calendar_id) {
        setCalendarId(profile.calendar_id);
      }
    } catch (error) {
      console.error('Error fetching calendar ID:', error);
      toast.error('Failed to fetch calendar settings');
    }
  };

  useEffect(() => {
    fetchCalendarId();
  }, []);

  useEffect(() => {
    if (calendarId) {
      fetchEvents();
    }
  }, [calendarId]);

  return {
    events,
    calendarId,
    isLoading,
    fetchEvents,
    setCalendarId
  };
};
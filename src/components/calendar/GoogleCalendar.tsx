import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarSettings } from './CalendarSettings';
import { EventForm } from './EventForm';
import { EventList } from './EventList';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  htmlLink?: string;
  contactId?: string;
  reminderStatus?: 'pending' | 'completed' | 'skipped';
}

export const GoogleCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const deleteEvent = async (eventId: string) => {
    try {
      console.log('Deleting event:', eventId);
      const { error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'deleteEvent', calendarId, eventData: { id: eventId } }
      });

      if (error) throw error;
      
      setEvents(events.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
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
      setCalendarId(profile?.calendar_id);
    } catch (error) {
      console.error('Error fetching calendar ID:', error);
      toast.error('Failed to fetch calendar settings');
    }
  };

  const extractContactInfo = (summary: string) => {
    const contactMatch = summary.toLowerCase().match(/(.+?)(?:\s*-\s*it's time to contact|time to contact\s*)/i);
    return contactMatch ? contactMatch[1].trim() : null;
  };

  const filterNextEventPerContact = async (events: CalendarEvent[]) => {
    const contactEventsMap = new Map<string, CalendarEvent>();
    
    for (const event of events) {
      const contactName = extractContactInfo(event.summary);
      
      if (contactName) {
        // Fetch contact information
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

  useEffect(() => {
    fetchCalendarId();
  }, []);

  useEffect(() => {
    if (calendarId) {
      fetchEvents();
    }
  }, [calendarId]);

  if (isLoading) {
    return <div className="p-4">Loading calendar...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Calendar Settings</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calendar Settings</DialogTitle>
              </DialogHeader>
              <CalendarSettings
                calendarId={calendarId}
                onCalendarIdUpdate={setCalendarId}
                isSettingsOpen={isSettingsOpen}
                onSettingsOpenChange={setIsSettingsOpen}
              />
            </DialogContent>
          </Dialog>

          {calendarId && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <EventForm
                  calendarId={calendarId}
                  onEventCreated={fetchEvents}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {!calendarId && (
        <div className="text-center p-8 border rounded-lg bg-muted">
          <p className="text-lg mb-4">Please set up your calendar ID to start managing events</p>
          <Button
            variant="outline"
            onClick={() => setIsSettingsOpen(true)}
          >
            Set Calendar ID
          </Button>
        </div>
      )}

      {calendarId && (
        <EventList
          events={events}
          onDeleteEvent={deleteEvent}
        />
      )}
    </div>
  );
};

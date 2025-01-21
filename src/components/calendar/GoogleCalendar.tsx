import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  htmlLink?: string;
}

export const GoogleCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    start: '',
    end: '',
  });
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const updateCalendarId = async (newCalendarId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ calendar_id: newCalendarId })
        .eq('id', user.id);

      if (error) throw error;

      setCalendarId(newCalendarId);
      toast.success('Calendar ID updated successfully');
      setIsSettingsOpen(false);
      fetchEvents(); // Refresh events with new calendar ID
    } catch (error) {
      console.error('Error updating calendar ID:', error);
      toast.error('Failed to update calendar ID');
    }
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

      if (error) {
        console.error('Error response from listEvents:', error);
        throw error;
      }
      
      console.log('Successfully fetched events:', data.items);
      setEvents(data.items || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async () => {
    if (!calendarId) {
      toast.error('Please set your calendar ID first');
      return;
    }

    try {
      console.log('Creating new event with data:', newEvent);
      const eventData = {
        summary: newEvent.summary,
        start: { dateTime: new Date(newEvent.start).toISOString() },
        end: { dateTime: new Date(newEvent.end).toISOString() },
      };

      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'createEvent', eventData, calendarId }
      });

      if (error) {
        console.error('Error response from createEvent:', error);
        throw error;
      }

      console.log('Successfully created event:', data);
      toast.success('Event created successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!calendarId) return;

    try {
      console.log('Deleting event with ID:', eventId);
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'deleteEvent', eventData: { id: eventId }, calendarId }
      });

      if (error) {
        console.error('Error response from deleteEvent:', error);
        throw error;
      }

      console.log('Successfully deleted event:', eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calendarId">Calendar ID</Label>
                  <Input
                    id="calendarId"
                    value={calendarId || ''}
                    onChange={(e) => setCalendarId(e.target.value)}
                    placeholder="example@gmail.com"
                  />
                </div>
                <Button onClick={() => calendarId && updateCalendarId(calendarId)}>
                  Save Calendar ID
                </Button>
              </div>
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
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="summary">Event Title</Label>
                    <Input
                      id="summary"
                      value={newEvent.summary}
                      onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start">Start Time</Label>
                    <Input
                      id="start"
                      type="datetime-local"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end">End Time</Label>
                    <Input
                      id="end"
                      type="datetime-local"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    />
                  </div>
                  <Button onClick={createEvent}>Create Event</Button>
                </div>
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
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{event.summary}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(event.start.dateTime).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {event.htmlLink && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(event.htmlLink, '_blank')}
                    title="Open in Google Calendar"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="destructive" onClick={() => deleteEvent(event.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

export const GoogleCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    start: '',
    end: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'listEvents' }
      });

      if (error) throw error;
      
      setEvents(data.items || []);
      console.log('Successfully fetched events:', data.items);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      const eventData = {
        summary: newEvent.summary,
        start: { dateTime: new Date(newEvent.start).toISOString() },
        end: { dateTime: new Date(newEvent.end).toISOString() },
      };

      const { error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'createEvent', eventData }
      });

      if (error) throw error;
      
      toast.success('Event created successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'deleteEvent', eventData: { id: eventId } }
      });

      if (error) throw error;
      
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading calendar...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
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
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{event.summary}</h3>
              <p className="text-sm text-gray-500">
                {new Date(event.start.dateTime).toLocaleString()}
              </p>
            </div>
            <Button variant="destructive" onClick={() => deleteEvent(event.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
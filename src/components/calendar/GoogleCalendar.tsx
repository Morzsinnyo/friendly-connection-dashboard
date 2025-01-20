import React, { useEffect, useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isConnected, setIsConnected] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (code && state) {
        try {
          console.log('Processing OAuth callback with code');
          const { error } = await supabase.functions.invoke('google-calendar', {
            body: { action: 'callback', eventData: { code, state } }
          });

          if (error) {
            console.error('Callback error:', error);
            throw error;
          }
          
          toast.success('Successfully connected to Google Calendar');
          // Remove query parameters
          window.history.replaceState({}, '', window.location.pathname);
          fetchEvents();
        } catch (error) {
          console.error('Error handling callback:', error);
          toast.error('Failed to connect to Google Calendar');
        }
      }
    };

    handleCallback();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('Fetching calendar events');
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'listEvents' }
      });

      if (error) {
        console.error('Error fetching events:', error);
        if (error.message?.includes('not connected')) {
          setIsConnected(false);
        }
        throw error;
      }
      
      console.log('Events fetched successfully:', data?.items?.length);
      setEvents(data.items || []);
      setIsConnected(true);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      console.log('Creating new event:', newEvent);
      const eventData = {
        summary: newEvent.summary,
        start: { dateTime: new Date(newEvent.start).toISOString() },
        end: { dateTime: new Date(newEvent.end).toISOString() },
      };

      const { error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'createEvent', eventData }
      });

      if (error) {
        console.error('Error creating event:', error);
        throw error;
      }
      
      console.log('Event created successfully');
      toast.success('Event created successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      console.log('Deleting event:', eventId);
      const { error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'deleteEvent', eventData: { id: eventId } }
      });

      if (error) {
        console.error('Error deleting event:', error);
        throw error;
      }
      
      console.log('Event deleted successfully');
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const connectCalendar = async () => {
    try {
      console.log('Initiating Google Calendar connection');
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'connect' }
      });

      if (error) {
        console.error('Connection error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Redirecting to OAuth URL');
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error('Failed to connect to Google Calendar');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (isLoading) {
    return <div>Loading calendar...</div>;
  }

  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold mb-4">Connect Your Google Calendar</h3>
        <Button onClick={connectCalendar}>Connect Google Calendar</Button>
      </div>
    );
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
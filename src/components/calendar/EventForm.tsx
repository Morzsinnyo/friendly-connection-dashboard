import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventFormProps {
  calendarId: string;
  onEventCreated: () => void;
}

export const EventForm = ({ calendarId, onEventCreated }: EventFormProps) => {
  const [newEvent, setNewEvent] = useState({
    summary: '',
    start: '',
    end: '',
  });

  const createEvent = async () => {
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

      if (error) throw error;

      console.log('Successfully created event:', data);
      toast.success('Event created successfully');
      onEventCreated();
      setNewEvent({ summary: '', start: '', end: '' });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  return (
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
  );
};
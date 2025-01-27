import { useState } from 'react';
import { calendarService } from '../services/calendarService';
import { toast } from 'sonner';

export const useEventManagement = (calendarId: string, onEventChange: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const createEvent = async (eventData: any) => {
    setIsLoading(true);
    try {
      const { error } = await calendarService.createEvent(calendarId, eventData);
      if (error) throw error;
      
      toast.success('Event created successfully');
      onEventChange();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setIsLoading(true);
    try {
      const { error } = await calendarService.deleteEvent(calendarId, eventId);
      if (error) throw error;
      
      toast.success('Event deleted successfully');
      onEventChange();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createEvent,
    deleteEvent
  };
};
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarSettings } from '@/components/calendar/CalendarSettings';
import { EventForm } from '../components/EventForm';
import { EventList } from '../components/EventList';
import { useCalendarState } from '../hooks/useCalendarState';
import { useEventManagement } from '../hooks/useEventManagement';

export const CalendarView = () => {
  const { events, calendarId, isLoading, fetchEvents, setCalendarId } = useCalendarState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { deleteEvent } = useEventManagement(calendarId || '', fetchEvents);

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
          onStatusChange={fetchEvents}
        />
      )}
    </div>
  );
};
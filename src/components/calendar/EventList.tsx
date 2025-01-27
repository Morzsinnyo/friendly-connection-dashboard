import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ReminderStatusBadge } from "./ReminderStatusBadge";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  htmlLink?: string;
  contactId?: string;
  reminderStatus?: 'pending' | 'completed' | 'skipped';
}

interface EventListProps {
  events: CalendarEvent[];
  onDeleteEvent: (eventId: string) => void;
  onStatusChange: () => void;
}

export const EventList = ({ events, onDeleteEvent, onStatusChange }: EventListProps) => {
  const isReminderEvent = (summary: string) => {
    return summary.toLowerCase().includes("time to contact");
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex justify-between items-center p-4 border rounded-lg">
          <div className="flex-1">
            <h3 className="font-medium">{event.summary}</h3>
            <p className="text-sm text-gray-500">
              {new Date(event.start.dateTime).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isReminderEvent(event.summary) && event.contactId && event.reminderStatus && (
              <ReminderStatusBadge
                status={event.reminderStatus}
                contactId={event.contactId}
                onStatusChange={onStatusChange}
              />
            )}
            
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
              <Button variant="destructive" onClick={() => onDeleteEvent(event.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
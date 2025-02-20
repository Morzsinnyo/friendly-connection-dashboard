
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
        <div key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg space-y-2 sm:space-y-0">
          <div className="w-full sm:flex-1">
            <h3 className="font-medium text-left">{event.summary}</h3>
            <p className="text-sm text-gray-500">
              {new Date(event.start.dateTime).toLocaleString()}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {isReminderEvent(event.summary) && event.contactId && event.reminderStatus && (
              <ReminderStatusBadge
                status={event.reminderStatus}
                contactId={event.contactId}
                onStatusChange={onStatusChange}
                eventSummary={event.summary}
              />
            )}
            
            <div className="flex gap-2 w-full sm:w-auto">
              {event.htmlLink && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(event.htmlLink, '_blank')}
                  title="Open in Google Calendar"
                  className="w-10 flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="destructive" 
                onClick={() => onDeleteEvent(event.id)}
                className="flex-1 sm:flex-initial"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

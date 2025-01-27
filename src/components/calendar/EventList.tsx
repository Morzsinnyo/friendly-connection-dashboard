import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ReminderStatusControl } from "../contacts/profile/ReminderStatusControl";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  htmlLink?: string;
}

interface EventListProps {
  events: CalendarEvent[];
  onDeleteEvent: (eventId: string) => void;
}

export const EventList = ({ events, onDeleteEvent }: EventListProps) => {
  // Helper function to extract contact ID from event summary
  const extractContactId = (summary: string): string | null => {
    const match = summary.match(/\[contact:([\w-]+)\]/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const contactId = extractContactId(event.summary);
        const displaySummary = event.summary.replace(/\[contact:[\w-]+\]/, '').trim();
        
        return (
          <div key={event.id} className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{displaySummary}</h3>
              <p className="text-sm text-gray-500">
                {new Date(event.start.dateTime).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              {contactId && (
                <ReminderStatusControl
                  contactId={contactId}
                  currentStatus="pending"
                />
              )}
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
        );
      })}
    </div>
  );
};
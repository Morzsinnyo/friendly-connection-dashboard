import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ReminderStatusControl } from "@/components/contacts/profile/ReminderStatusControl";

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
  onEventStatusChange?: () => void;
  showReminderControl?: boolean;
}

export const EventList = ({ 
  events, 
  onDeleteEvent, 
  onEventStatusChange,
  showReminderControl = true 
}: EventListProps) => {
  const getContactIdFromSummary = (summary: string): string | undefined => {
    const match = summary.match(/contact-id:(\S+)/);
    return match ? match[1] : undefined;
  };

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const contactId = getContactIdFromSummary(event.summary);
        const displaySummary = event.summary.replace(/contact-id:\S+\s*/, '').trim();

        return (
          <div key={event.id} className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-medium">{displaySummary}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(event.start.dateTime).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showReminderControl && contactId && (
                <ReminderStatusControl
                  contactId={contactId}
                  currentStatus={event.reminderStatus || 'pending'}
                  onStatusChange={onEventStatusChange}
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
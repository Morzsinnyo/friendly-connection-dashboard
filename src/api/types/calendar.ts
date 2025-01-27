export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  contactId?: string;
  reminderStatus?: 'pending' | 'completed' | 'skipped';
  htmlLink?: string;
}

export interface CalendarEventCreate extends Omit<CalendarEvent, 'id'> {}
export interface CalendarEventUpdate extends Partial<CalendarEvent> {}
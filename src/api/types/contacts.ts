import { Json } from '@/integrations/supabase/types';
import { EditorContent } from './editor';

export type ReminderStatus = 'pending' | 'completed' | 'skipped';

// Base interface for contact data as it exists in the database
export interface ContactResponse {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email?: string | null;
  business_phone?: string | null;
  mobile_phone?: string | null;
  status?: string | null;
  birthday?: string | null;
  notes?: Json | null;
  avatar_url?: string | null;
  last_contact?: string | null;
  gift_ideas?: string[];
  job_title?: string | null;
  company?: string | null;
  friendship_score?: number;
  tags?: string[];
  related_contacts?: string[];
  scheduled_followup?: string | null;
  reminder_frequency?: string | null;
  next_reminder?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  facebook_url?: string | null;
  last_reminder_completed?: string | null;
  calendar_event_id?: string | null;
  reminder_status?: ReminderStatus;
  custom_recurrence_interval?: number | null;
  custom_recurrence_unit?: string | null;
  custom_recurrence_ends?: string | null;
  custom_recurrence_end_date?: string | null;
  custom_recurrence_occurrences?: number | null;
  note_version?: number;
}

// Interface for contact data after transformation for frontend use
export interface Contact extends Omit<ContactResponse, 'notes'> {
  notes?: EditorContent;
}

export type ContactInsert = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;
export type ContactUpdate = Partial<ContactInsert>;

// Type guard to check if a value is a valid ContactResponse
export function isContactResponse(value: unknown): value is ContactResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'user_id' in value &&
    'full_name' in value
  );
}

// Transform database response to frontend Contact type
export function transformContactResponse(response: ContactResponse): Contact {
  if (!response) return response;

  // Handle the notes field transformation
  let transformedNotes: EditorContent = null;
  if (response.notes) {
    try {
      // If notes is already a string, use it directly
      if (typeof response.notes === 'string') {
        transformedNotes = response.notes;
      } 
      // If it's JSON, stringify it
      else {
        transformedNotes = JSON.stringify(response.notes);
      }
    } catch (error) {
      console.error('Error transforming notes:', error);
      transformedNotes = null;
    }
  }
  
  return {
    ...response,
    notes: transformedNotes,
    reminder_status: response.reminder_status || 'pending'
  };
}

// Transform frontend Contact type to database format
export function transformContactForDatabase(contact: Partial<Contact>): Partial<ContactResponse> {
  if (!contact) return contact;

  const { notes, ...rest } = contact;
  
  let transformedNotes: Json | null = null;
  if (notes) {
    try {
      // If notes is a string and looks like JSON, parse it
      if (typeof notes === 'string' && (notes.startsWith('{') || notes.startsWith('['))) {
        transformedNotes = JSON.parse(notes);
      } else {
        // Otherwise store as is
        transformedNotes = notes;
      }
    } catch (error) {
      console.error('Error transforming notes for database:', error);
      transformedNotes = null;
    }
  }

  return {
    ...rest,
    notes: transformedNotes,
  };
}

// Add ContactFilters type that was missing
export interface ContactFilters {
  search?: string;
  tags?: string[];
  status?: string;
}
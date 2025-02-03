import { Json } from '@/integrations/supabase/types';
import { EditorContent } from './editor';

// Enhanced ReminderStatus enum with more descriptive states
export enum ReminderStatus {
  Pending = 'pending',
  Completed = 'completed',
  Skipped = 'skipped',
  Overdue = 'overdue',
  InProgress = 'in_progress'
}

// New interface for structured note content
export interface NoteContent {
  blocks: NoteBlock[];
  version: number;
}

export interface NoteBlock {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'bullet' | 'quote' | 'code';
  content: string;
  metadata?: Record<string, unknown>;
}

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

// Enhanced interface for contact data after transformation for frontend use
export interface Contact extends Omit<ContactResponse, 'notes'> {
  notes?: EditorContent | NoteContent;
}

// Enhanced contact insert type
export type ContactInsert = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;

// Enhanced contact update type with partial fields
export type ContactUpdate = Partial<ContactInsert>;

// Enhanced filters interface with additional filter options
export interface ContactFilters {
  status?: string[];
  company?: string[];
  searchQuery?: string;
  search?: string;
  tags?: string[];
  reminderStatus?: ReminderStatus[];
  hasReminder?: boolean;
  lastContactBefore?: Date;
  lastContactAfter?: Date;
}

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

// Type guard for NoteContent
export function isNoteContent(value: unknown): value is NoteContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'blocks' in value &&
    'version' in value &&
    Array.isArray((value as NoteContent).blocks)
  );
}

// Transform database response to frontend Contact type
export function transformContactResponse(response: ContactResponse): Contact {
  if (!response) return response;

  let transformedNotes: EditorContent | NoteContent | null = null;
  
  if (response.notes) {
    try {
      // If notes is already a string, use it directly
      if (typeof response.notes === 'string') {
        transformedNotes = response.notes;
      } 
      // If it's a NoteContent object, preserve its structure
      else if (isNoteContent(response.notes)) {
        transformedNotes = response.notes;
      }
      // Otherwise, stringify it
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
    reminder_status: response.reminder_status || ReminderStatus.Pending
  };
}

// Transform frontend Contact type to database format
export function transformContactForDatabase(contact: Partial<Contact>): Partial<ContactResponse> {
  if (!contact) return contact;

  const { notes, ...rest } = contact;
  
  let transformedNotes: Json | null = null;
  if (notes) {
    try {
      // If notes is a NoteContent object, store as is
      if (isNoteContent(notes)) {
        transformedNotes = notes;
      }
      // If notes is a string and looks like JSON, parse it
      else if (typeof notes === 'string' && (notes.startsWith('{') || notes.startsWith('['))) {
        transformedNotes = JSON.parse(notes);
      } 
      // Otherwise store as is
      else {
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

import { Json } from '@/integrations/supabase/types';
import { EditorContent } from './editor';

export interface Contact {
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
  notes?: EditorContent;
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

export type ContactInsert = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;
export type ContactUpdate = Partial<ContactInsert>;

export type ReminderStatus = 'pending' | 'completed' | 'skipped';

export interface ContactFilters {
  status?: string[];
  company?: string[];
  searchQuery?: string;
}

export type ContactResponse = Omit<Contact, 'notes'> & {
  notes?: Json;
};

export function transformContactResponse(response: ContactResponse): Contact {
  if (!response) return response;
  
  return {
    ...response,
    notes: response.notes ? String(response.notes) : null,
  };
}
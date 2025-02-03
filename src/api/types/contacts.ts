import { Database } from "@/integrations/supabase/types";

export type Contact = Database['public']['Tables']['contacts']['Row'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export type ReminderStatus = 'pending' | 'completed' | 'skipped';

export interface ContactFilters {
  status?: string[];
  company?: string[];
  searchQuery?: string;
}

export function getNoteContent(note: any): string {
  if (!note) return '';
  if (typeof note === 'string') return note;
  if (typeof note === 'object' && note.content) return note.content;
  return '';
}
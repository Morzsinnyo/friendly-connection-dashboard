import { Database } from "@/integrations/supabase/types";
import { Note, parseNotes } from "./notes";

export type Contact = Database['public']['Tables']['contacts']['Row'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export type ReminderStatus = 'pending' | 'completed' | 'skipped';

export interface ContactFilters {
  status?: string[];
  company?: string[];
  searchQuery?: string;
}

export function getNoteContent(note: any): Note[] {
  console.log('Getting note content:', note);
  return parseNotes(note);
}
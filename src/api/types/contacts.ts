import { Database } from "@/integrations/supabase/types";
import { EditorContent } from "./editor";

// Helper type to transform Json to EditorContent
type TransformNotes<T> = Omit<T, 'notes'> & {
  notes?: EditorContent | null;
};

export type Contact = TransformNotes<Database['public']['Tables']['contacts']['Row']>;
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export type ReminderStatus = 'pending' | 'completed' | 'skipped';

export interface ContactFilters {
  status?: string[];
  company?: string[];
  searchQuery?: string;
}

// Helper function to transform database notes to EditorContent
export const transformDatabaseNotes = (notes: any): EditorContent | null => {
  if (!notes) return null;
  
  // If notes is already in EditorContent format
  if (typeof notes === 'object' && notes.type === 'doc') {
    return notes as EditorContent;
  }
  
  // If notes is a string
  if (typeof notes === 'string') {
    return notes;
  }
  
  // Convert other formats to string
  return String(notes);
};

// Helper function to transform EditorContent to database format
export const transformNotesToDatabase = (notes: EditorContent | null): any => {
  if (!notes) return null;
  
  if (typeof notes === 'string') {
    return notes;
  }
  
  return notes;
};
import { Database } from "@/integrations/supabase/types";
import { EditorContent } from "./editor";

export type Contact = Omit<Database['public']['Tables']['contacts']['Row'], 'notes'> & {
  notes?: EditorContent | null;
};
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export type ReminderStatus = 'pending' | 'completed' | 'skipped';

export interface ContactFilters {
  status?: string[];
  company?: string[];
  searchQuery?: string;
}
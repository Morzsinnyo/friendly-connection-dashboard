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

export type RecurrenceUnit = 'day' | 'week' | 'month' | 'year';
export type RecurrenceEnds = 'never' | 'on' | 'after';

export interface CustomRecurrence {
  interval: number;
  unit: RecurrenceUnit;
  ends: RecurrenceEnds;
  endDate: string | null;
  occurrences: number | null;
}
import { Database } from "@/integrations/supabase/types";

export type Activity = Database['public']['Tables']['events']['Row'];
export type ActivityInsert = Database['public']['Tables']['events']['Insert'];
export type ActivityUpdate = Database['public']['Tables']['events']['Update'];

export interface ActivityFilters {
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}
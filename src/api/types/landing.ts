
import { Database } from "@/integrations/supabase/types";

export type LandingSubscriber = Database['public']['Tables']['landing_subscribers']['Row'];
export type LandingSubscriberInsert = Database['public']['Tables']['landing_subscribers']['Insert'];

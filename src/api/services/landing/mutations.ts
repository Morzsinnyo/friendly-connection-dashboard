
import { supabase } from "@/integrations/supabase/client";
import { LandingSubscriberInsert } from "@/api/types/landing";
import { ApiResponse } from "@/api/types/common";

export const landingMutations = {
  subscribeEmail: async (email: string): Promise<ApiResponse<null>> => {
    console.log('Subscribing email:', email);
    
    const subscriber: LandingSubscriberInsert = {
      email: email.toLowerCase().trim()
    };

    const { error } = await supabase
      .from('landing_subscribers')
      .insert(subscriber);

    if (error) {
      console.error('Supabase error:', error);
      return { data: null, error };
    }
    
    return { data: null, error: null };
  }
};

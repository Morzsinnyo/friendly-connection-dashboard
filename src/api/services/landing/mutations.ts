
import { supabase } from "@/integrations/supabase/client";
import { LandingSubscriberInsert } from "@/api/types/landing";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";

export const landingMutations = {
  subscribeEmail: async (email: string): Promise<ApiResponse<null>> => {
    console.log('Subscribing email:', email);
    
    const subscriber: LandingSubscriberInsert = {
      email: email.toLowerCase().trim()
    };

    const query = supabase
      .from('landing_subscribers')
      .insert(subscriber);

    return formatApiResponse(query);
  }
};

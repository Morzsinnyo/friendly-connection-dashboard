
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

    // Execute the query immediately to get a Promise
    const query = await supabase
      .from('landing_subscribers')
      .insert(subscriber)
      .select()
      .single();

    // Since we already awaited the query, wrap it in Promise.resolve
    return formatApiResponse(Promise.resolve(query));
  }
};


import { supabase } from "@/integrations/supabase/client";

export const landingMutations = {
  subscribeEmail: async (email: string) => {
    const { error } = await supabase
      .from('landing_subscribers')
      .insert({ email: email.toLowerCase().trim() });
    
    return { success: !error, error };
  }
};

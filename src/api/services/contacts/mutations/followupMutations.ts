import { Contact } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";
import { supabase } from "@/integrations/supabase/client";

export const followupMutations = {
  updateFollowup: async (id: string, date: Date): Promise<ApiResponse<Contact>> => {
    console.log('Updating followup for contact:', id, date);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .update({ scheduled_followup: date.toISOString() })
        .eq('id', id)
        .select()
        .single()
    );

    return formatApiResponse(query);
  },

  updateLastContact: async (id: string, date?: Date): Promise<ApiResponse<Contact>> => {
    console.log('Updating last contact date:', { id, date });
    
    const lastContact = date ? date.toISOString() : new Date().toISOString();
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .update({ last_contact: lastContact })
        .eq('id', id)
        .select()
        .single()
    );

    return formatApiResponse(query);
  }
};
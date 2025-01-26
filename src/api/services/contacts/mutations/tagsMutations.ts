import { Contact } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";
import { supabase } from "@/integrations/supabase/client";

export const tagsMutations = {
  updateTags: async (id: string, tags: string[]): Promise<ApiResponse<Contact>> => {
    console.log('Updating tags for contact:', id, tags);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .update({ tags })
        .eq('id', id)
        .select()
        .single()
    );

    return formatApiResponse(query);
  },

  updateGiftIdeas: async (id: string, giftIdeas: string[]): Promise<ApiResponse<Contact>> => {
    console.log('Updating gift ideas for contact:', id, giftIdeas);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .update({ gift_ideas: giftIdeas })
        .eq('id', id)
        .select()
        .single()
    );

    return formatApiResponse(query);
  }
};
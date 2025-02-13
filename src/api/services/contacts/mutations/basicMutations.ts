
import { Contact, ContactInsert, ContactUpdate } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";
import { supabase } from "@/integrations/supabase/client";

export const basicMutations = {
  create: async (contact: ContactInsert): Promise<ApiResponse<Contact>> => {
    console.log('Creating new contact:', contact);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single()
    );

    return formatApiResponse(query);
  },

  update: async (id: string, updates: ContactUpdate): Promise<ApiResponse<Contact>> => {
    console.log('Updating contact:', { id, updates });
    
    try {
      const query = Promise.resolve(
        supabase
          .from('contacts')
          .update(updates)
          .eq('id', id)
          .select()
          .maybeSingle()
      );

      const response = await formatApiResponse(query);
      console.log('Update response:', response);
      return response;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    console.log('Deleting contact:', id);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .delete()
        .eq('id', id)
    );

    return formatApiResponse(query);
  }
};

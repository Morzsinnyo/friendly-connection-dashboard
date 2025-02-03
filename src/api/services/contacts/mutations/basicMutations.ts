import { Contact, ContactInsert, ContactUpdate } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatContactResponse } from "@/api/utils/response-formatting";
import { supabase } from "@/integrations/supabase/client";

export const basicMutations = {
  create: async (contact: ContactInsert): Promise<ApiResponse<Contact>> => {
    console.log('Creating new contact:', contact);
    
    const query = supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    return formatContactResponse(query);
  },

  update: async (id: string, updates: ContactUpdate): Promise<ApiResponse<Contact>> => {
    console.log('Updating contact:', id, updates);
    
    const query = supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return formatContactResponse(query);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    console.log('Deleting contact:', id);
    
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    return {
      data: null,
      error,
    };
  }
};
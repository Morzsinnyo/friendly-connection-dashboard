import { supabase } from "@/integrations/supabase/client";
import { Contact, ContactFilters, ContactInsert, ContactUpdate } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";

export const contactService = {
  getAll: async (filters?: ContactFilters): Promise<ApiResponse<Contact[]>> => {
    console.log('Fetching all contacts with filters:', filters);
    
    let query = supabase
      .from('contacts')
      .select('*')
      .order('full_name');

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.company?.length) {
      query = query.in('company', filters.company);
    }

    if (filters?.searchQuery) {
      query = query.ilike('full_name', `%${filters.searchQuery}%`);
    }

    return formatApiResponse(Promise.resolve(query));
  },

  getById: async (id: string): Promise<ApiResponse<Contact>> => {
    console.log('Fetching contact by ID:', id);
    return formatApiResponse(
      Promise.resolve(
        supabase
          .from('contacts')
          .select('*')
          .eq('id', id)
          .maybeSingle()
      )
    );
  },

  create: async (contact: ContactInsert): Promise<ApiResponse<Contact>> => {
    console.log('Creating new contact:', contact);
    return formatApiResponse(
      Promise.resolve(
        supabase
          .from('contacts')
          .insert(contact)
          .select()
          .single()
      )
    );
  },

  update: async (id: string, updates: ContactUpdate): Promise<ApiResponse<Contact>> => {
    console.log('Updating contact:', id, updates);
    return formatApiResponse(
      Promise.resolve(
        supabase
          .from('contacts')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      )
    );
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    console.log('Deleting contact:', id);
    return formatApiResponse(
      Promise.resolve(
        supabase
          .from('contacts')
          .delete()
          .eq('id', id)
      )
    );
  }
};
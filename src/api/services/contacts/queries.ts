import { supabase } from "@/integrations/supabase/client";
import { Contact, ContactFilters } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";

export const contactQueries = {
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
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .maybeSingle()
    );

    return formatApiResponse(query);
  },

  getByIds: async (ids: string[]): Promise<ApiResponse<Contact[]>> => {
    console.log('Fetching contacts by IDs:', ids);
    
    const query = Promise.resolve(
      supabase
        .from('contacts')
        .select('*')
        .in('id', ids)
    );

    return formatApiResponse(query);
  },

  getRelatedContacts: async (contactId: string): Promise<ApiResponse<Contact[]>> => {
    console.log('Fetching related contacts for ID:', contactId);
    
    const { data: contact } = await supabase
      .from('contacts')
      .select('related_contacts')
      .eq('id', contactId)
      .maybeSingle();

    if (!contact?.related_contacts?.length) {
      return { data: [], error: null };
    }

    return contactQueries.getByIds(contact.related_contacts);
  }
};
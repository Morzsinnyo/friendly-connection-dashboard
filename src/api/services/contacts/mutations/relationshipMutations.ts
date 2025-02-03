import { Contact } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatContactResponse } from "@/api/utils/response-formatting";
import { supabase } from "@/integrations/supabase/client";

export const relationshipMutations = {
  updateRelatedContacts: async (
    contactAId: string,
    contactBId: string,
    isAdding: boolean
  ): Promise<ApiResponse<Contact>> => {
    console.log('Updating related contacts:', { contactAId, contactBId, isAdding });
    
    const { data: contacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id, related_contacts')
      .in('id', [contactAId, contactBId]);
    
    if (fetchError) {
      console.error('Error fetching contacts:', fetchError);
      throw fetchError;
    }

    const contactA = contacts?.find(c => c.id === contactAId);
    const contactB = contacts?.find(c => c.id === contactBId);

    if (!contactA || !contactB) {
      console.error('One or both contacts not found');
      throw new Error('Contacts not found');
    }

    const contactARelated = contactA.related_contacts || [];
    const contactBRelated = contactB.related_contacts || [];

    const newContactARelated = isAdding
      ? [...new Set([...contactARelated, contactBId])]
      : contactARelated.filter(id => id !== contactBId);

    const newContactBRelated = isAdding
      ? [...new Set([...contactBRelated, contactAId])]
      : contactBRelated.filter(id => id !== contactAId);

    const { error: updateErrorA } = await supabase
      .from('contacts')
      .update({ related_contacts: newContactARelated })
      .eq('id', contactAId);

    if (updateErrorA) {
      console.error('Error updating contact A:', updateErrorA);
      throw updateErrorA;
    }

    const { error: updateErrorB } = await supabase
      .from('contacts')
      .update({ related_contacts: newContactBRelated })
      .eq('id', contactBId);

    if (updateErrorB) {
      console.error('Error updating contact B:', updateErrorB);
      throw updateErrorB;
    }

    const query = supabase
      .from('contacts')
      .select('*')
      .eq('id', contactAId)
      .single();

    return formatContactResponse(Promise.resolve(query));
  },

  updateFriendshipScore: async (id: string, score: number): Promise<ApiResponse<Contact>> => {
    console.log('Updating friendship score for contact:', id, score);
    
    const query = supabase
      .from('contacts')
      .update({ friendship_score: score })
      .eq('id', id)
      .select('*')
      .single();

    return formatContactResponse(Promise.resolve(query));
  }
};
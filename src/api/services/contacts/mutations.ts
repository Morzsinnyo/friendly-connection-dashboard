import { supabase } from "@/integrations/supabase/client";
import { Contact, ContactInsert, ContactUpdate } from "@/api/types/contacts";
import { ApiResponse } from "@/api/types/common";
import { formatApiResponse } from "@/api/utils/response-formatting";

export const contactMutations = {
  create: async (contact: ContactInsert): Promise<ApiResponse<Contact>> => {
    console.log('Creating new contact:', contact);
    
    const query = supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    return formatApiResponse(query);
  },

  update: async (id: string, updates: ContactUpdate): Promise<ApiResponse<Contact>> => {
    console.log('Updating contact:', id, updates);
    
    const query = supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return formatApiResponse(query);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    console.log('Deleting contact:', id);
    
    const query = supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .then(() => null);

    return formatApiResponse(query);
  },

  updateFollowup: async (id: string, date: Date): Promise<ApiResponse<Contact>> => {
    console.log('Updating followup for contact:', id, date);
    
    return contactMutations.update(id, {
      scheduled_followup: date.toISOString()
    });
  },

  updateReminder: async (
    id: string, 
    frequency: string, 
    nextReminder: Date
  ): Promise<ApiResponse<Contact>> => {
    console.log('Updating reminder for contact:', id, frequency, nextReminder);
    
    return contactMutations.update(id, {
      reminder_frequency: frequency,
      next_reminder: nextReminder.toISOString()
    });
  },

  updateGiftIdeas: async (id: string, giftIdeas: string[]): Promise<ApiResponse<Contact>> => {
    console.log('Updating gift ideas for contact:', id, giftIdeas);
    
    return contactMutations.update(id, {
      gift_ideas: giftIdeas
    });
  },

  updateFriendshipScore: async (id: string, score: number): Promise<ApiResponse<Contact>> => {
    console.log('Updating friendship score for contact:', id, score);
    
    return contactMutations.update(id, {
      friendship_score: score
    });
  },

  updateTags: async (id: string, tags: string[]): Promise<ApiResponse<Contact>> => {
    console.log('Updating tags for contact:', id, tags);
    
    return contactMutations.update(id, {
      tags: tags
    });
  }
};
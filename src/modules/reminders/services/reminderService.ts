import { supabase } from "@/integrations/supabase/client";

export const reminderService = {
  updateStatus: async (contactId: string, status: 'pending' | 'completed' | 'skipped') => {
    console.log('Updating reminder status:', { contactId, status });
    
    return supabase
      .from('contacts')
      .update({ reminder_status: status })
      .eq('id', contactId)
      .select()
      .single();
  },

  getStatus: async (contactId: string) => {
    console.log('Fetching reminder status for contact:', contactId);
    
    return supabase
      .from('contacts')
      .select('reminder_status')
      .eq('id', contactId)
      .single();
  }
};
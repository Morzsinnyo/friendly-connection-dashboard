import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContactProfile = (id: string | undefined) => {
  console.log('useContactProfile hook called with ID:', id);
  
  return useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      console.log('Starting contact fetch for ID:', id);
      if (!id) {
        console.error('No contact ID provided');
        throw new Error('No contact ID provided');
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching contact:', error);
        throw error;
      }

      if (!data) {
        console.error('No contact found with ID:', id);
        throw new Error('Contact not found');
      }
      
      console.log('Contact data successfully fetched:', data);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    retry: 2,
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
      }
    }
  });
};
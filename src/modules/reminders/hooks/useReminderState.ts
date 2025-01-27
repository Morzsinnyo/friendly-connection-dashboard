import { useState } from 'react';
import { reminderService } from '../services/reminderService';
import { toast } from 'sonner';

export const useReminderState = (contactId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (status: 'pending' | 'completed' | 'skipped') => {
    setIsLoading(true);
    try {
      const { error } = await reminderService.updateStatus(contactId, status);
      if (error) throw error;
      
      toast.success(`Reminder marked as ${status}`);
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast.error('Failed to update reminder status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    updateStatus
  };
};
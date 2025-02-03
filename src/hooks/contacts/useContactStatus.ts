import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactMutations } from "@/api/services/contacts/mutations";
import { toast } from "sonner";
import { ReminderStatus } from "@/api/types/contacts";

export const useContactStatus = (contactId: string) => {
  const queryClient = useQueryClient();

  const updateReminderStatusMutation = useMutation({
    mutationFn: async (status: ReminderStatus) => {
      const result = await contactMutations.updateReminderStatus(contactId, status);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Reminder status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating reminder status:', error);
      toast.error('Failed to update reminder status');
    },
  });

  const updateLastContactMutation = useMutation({
    mutationFn: async (date?: Date) => {
      const result = await contactMutations.updateLastContact(contactId, date);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Last contact date updated');
    },
    onError: (error) => {
      console.error('Error updating last contact date:', error);
      toast.error('Failed to update last contact date');
    },
  });

  return {
    updateReminderStatus: updateReminderStatusMutation.mutate,
    updateLastContact: updateLastContactMutation.mutate,
    isUpdating: updateReminderStatusMutation.isPending || updateLastContactMutation.isPending,
  };
};
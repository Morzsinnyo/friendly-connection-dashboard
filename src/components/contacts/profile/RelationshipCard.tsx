import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { contactQueries } from "@/api/services/contacts/queries";
import { contactMutations } from "@/api/services/contacts/mutations";

interface RelationshipCardProps {
  friendshipScore: number;
  contactId: string;
}

export function RelationshipCard({ friendshipScore, contactId }: RelationshipCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch related contacts
  const { data: relatedContacts, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['related-contacts', contactId],
    queryFn: () => contactQueries.getRelatedContacts(contactId),
  });

  // Fetch all available contacts
  const { data: availableContacts } = useQuery({
    queryKey: ['available-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, full_name, email, avatar_url')
        .neq('id', contactId);
      
      if (error) throw error;
      return data;
    },
  });

  const updateRelatedContactsMutation = useMutation({
    mutationFn: async ({ selectedId, isAdding }: { selectedId: string; isAdding: boolean }) => {
      await contactMutations.updateRelatedContacts(contactId, selectedId, isAdding);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['related-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact'] });
      toast.success('Related contacts updated');
    },
    onError: (error) => {
      toast.error('Failed to update related contacts');
      console.error('Error updating related contacts:', error);
    },
  });

  const handleContactSelect = (selectedId: string, isChecked: boolean) => {
    updateRelatedContactsMutation.mutate({ selectedId, isAdding: isChecked });
  };

  const navigateToContact = (id: string) => {
    navigate(`/contact/${id}`);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Related Contacts</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingRelated ? (
              <div className="text-sm text-gray-500">Loading related contacts...</div>
            ) : relatedContacts?.data?.length ? (
              <div className="space-y-2">
                {relatedContacts.data.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigateToContact(contact.id)}
                  >
                    <img
                      src={contact.avatar_url || '/placeholder.svg'}
                      alt={contact.full_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium">{contact.full_name}</p>
                      <p className="text-xs text-gray-600">{contact.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No related contacts yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Related Contacts</DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            {availableContacts?.map((contact) => (
              <div key={contact.id} className="flex items-center space-x-2 p-2">
                <Checkbox
                  id={contact.id}
                  checked={relatedContacts?.data?.some(rc => rc.id === contact.id)}
                  onCheckedChange={(checked) => handleContactSelect(contact.id, checked as boolean)}
                  disabled={updateRelatedContactsMutation.isPending}
                />
                <label
                  htmlFor={contact.id}
                  className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <img
                    src={contact.avatar_url || '/placeholder.svg'}
                    alt={contact.full_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{contact.full_name}</p>
                    <p className="text-xs text-gray-600">{contact.email}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
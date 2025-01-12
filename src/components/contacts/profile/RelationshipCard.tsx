import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface RelationshipCardProps {
  friendshipScore: number;
  contactId: string;
  relatedContacts: Array<{
    name: string;
    email: string;
    avatar: string;
  }>;
}

export function RelationshipCard({ friendshipScore, contactId, relatedContacts }: RelationshipCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: contacts } = useQuery({
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
    mutationFn: async (selectedIds: string[]) => {
      const { error } = await supabase
        .from('contacts')
        .update({ related_contacts: selectedIds })
        .eq('id', contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Related contacts updated');
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update related contacts');
      console.error('Error updating related contacts:', error);
    },
  });

  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      }
      return [...prev, contactId];
    });
  };

  const handleSave = () => {
    updateRelatedContactsMutation.mutate(selectedContacts);
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
            {relatedContacts.length > 0 ? (
              <div className="space-y-3">
                {relatedContacts.map((contact, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <img
                      src={contact.avatar || '/placeholder.svg'}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No related contacts selected</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Contacts</DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            {contacts?.map((contact) => (
              <div key={contact.id} className="flex items-center space-x-2 p-2">
                <Checkbox
                  id={contact.id}
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={() => handleContactSelect(contact.id)}
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
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
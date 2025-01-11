import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RelationshipCardProps {
  friendshipScore: number;
  contactId: string;
  relatedContacts: Array<{
    name: string;
    email: string;
    avatar: string;
  }>;
}

export function RelationshipCard({ contactId }: RelationshipCardProps) {
  const queryClient = useQueryClient();
  const [isSelectingContact, setIsSelectingContact] = useState(false);

  // Fetch all contacts for selection
  const { data: availableContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, full_name, email, avatar_url');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch related contacts
  const { data: contact } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('related_contacts')
        .eq('id', contactId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch details of related contacts
  const { data: relatedContactsDetails } = useQuery({
    queryKey: ['related-contacts', contact?.related_contacts],
    enabled: !!contact?.related_contacts?.length,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, full_name, email, avatar_url')
        .in('id', contact.related_contacts || []);
      
      if (error) throw error;
      return data;
    },
  });

  const updateRelatedContactsMutation = useMutation({
    mutationFn: async (newRelatedContacts: string[]) => {
      const { error } = await supabase
        .from('contacts')
        .update({ related_contacts: newRelatedContacts })
        .eq('id', contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['related-contacts'] });
      toast.success('Related contacts updated');
    },
    onError: (error) => {
      toast.error('Failed to update related contacts');
      console.error('Error updating related contacts:', error);
    },
  });

  const handleAddRelatedContact = (newContactId: string) => {
    const currentRelated = contact?.related_contacts || [];
    if (!currentRelated.includes(newContactId)) {
      updateRelatedContactsMutation.mutate([...currentRelated, newContactId]);
    }
    setIsSelectingContact(false);
  };

  const handleRemoveRelatedContact = (contactIdToRemove: string) => {
    const currentRelated = contact?.related_contacts || [];
    updateRelatedContactsMutation.mutate(
      currentRelated.filter(id => id !== contactIdToRemove)
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Related Contacts</CardTitle>
        <DropdownMenu open={isSelectingContact} onOpenChange={setIsSelectingContact}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableContacts?.filter(c => 
              c.id !== contactId && 
              !contact?.related_contacts?.includes(c.id)
            ).map((contact) => (
              <DropdownMenuItem
                key={contact.id}
                onClick={() => handleAddRelatedContact(contact.id)}
              >
                <div className="flex items-center space-x-2">
                  {contact.avatar_url && (
                    <img
                      src={`${supabase.storage.from('avatars').getPublicUrl(contact.avatar_url).data.publicUrl}`}
                      alt={contact.full_name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{contact.full_name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="mt-4">
            <div className="space-y-2">
              {relatedContactsDetails?.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-2">
                    {contact.avatar_url && (
                      <img
                        src={`${supabase.storage.from('avatars').getPublicUrl(contact.avatar_url).data.publicUrl}`}
                        alt={contact.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">{contact.full_name}</p>
                      <p className="text-xs text-gray-600">{contact.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveRelatedContact(contact.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const [score, setScore] = useState(friendshipScore);
  const queryClient = useQueryClient();

  const updateFriendshipScoreMutation = useMutation({
    mutationFn: async (newScore: number) => {
      const { error } = await supabase
        .from('contacts')
        .update({ friendship_score: newScore })
        .eq('id', contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      toast.success('Friendship score updated');
    },
    onError: (error) => {
      toast.error('Failed to update friendship score');
      console.error('Error updating friendship score:', error);
    },
  });

  const handleScoreChange = (value: number[]) => {
    setScore(value[0]);
    updateFriendshipScoreMutation.mutate(value[0]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Related Contacts</CardTitle>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="mt-4">
            <div className="space-y-2">
              {relatedContacts.map((contact, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-600">{contact.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
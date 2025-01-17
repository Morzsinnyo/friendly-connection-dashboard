import { useState } from "react";
import { Edit, Trash, Plus, Bell, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FriendshipScore } from "./header/FriendshipScore";
import { TagsSection } from "./header/TagsSection";
import { GiftIdeasDropdown } from "./header/GiftIdeasDropdown";
import { AgeDisplay } from "./header/AgeDisplay";

interface ContactHeaderProps {
  contact: any;
  isEditing: boolean;
  editedContact: any;
  setEditedContact: (contact: any) => void;
  handleEdit: () => void;
  giftIdeas: string[];
  onAddGiftIdea: (idea: string) => void;
}

export function ContactHeader({
  contact,
  isEditing,
  editedContact,
  setEditedContact,
  handleEdit,
  giftIdeas,
  onAddGiftIdea,
}: ContactHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(contact.friendship_score || 0);

  const updateTagsMutation = useMutation({
    mutationFn: async (tags: string[]) => {
      const { error } = await supabase
        .from('contacts')
        .update({ tags })
        .eq('id', contact.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contact.id] });
      toast.success('Tags updated');
    },
    onError: (error) => {
      toast.error('Failed to update tags');
      console.error('Error updating tags:', error);
    },
  });

  const updateFriendshipScoreMutation = useMutation({
    mutationFn: async (newScore: number) => {
      const { error } = await supabase
        .from('contacts')
        .update({ friendship_score: newScore })
        .eq('id', contact.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', contact.id] });
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

  const handleAddTag = (newTag: string) => {
    const updatedTags = [...(contact.tags || []), newTag];
    updateTagsMutation.mutate(updatedTags);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = (contact.tags || []).filter(tag => tag !== tagToRemove);
    updateTagsMutation.mutate(updatedTags);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <img
            src={contact.avatar || "/placeholder.svg"}
            alt={contact.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            
            {(contact.job_title || contact.company) && (
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Briefcase className="h-4 w-4" />
                <span>
                  {contact.job_title} {contact.job_title && contact.company && "at"} {contact.company}
                </span>
              </div>
            )}

            <FriendshipScore score={score} onScoreChange={handleScoreChange} />
            
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {contact.relationship}
              </Badge>
              {contact.birthday && <AgeDisplay birthday={contact.birthday} />}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate(`/contact/create?edit=${contact.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
          <Button variant="destructive">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <TagsSection
        tags={contact.tags || []}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />

      <div className="flex space-x-2">
        <GiftIdeasDropdown giftIdeas={giftIdeas} onAddGiftIdea={onAddGiftIdea} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Reminder
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Every week</DropdownMenuItem>
            <DropdownMenuItem>Every 2 weeks</DropdownMenuItem>
            <DropdownMenuItem>Monthly</DropdownMenuItem>
            <DropdownMenuItem>Custom...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
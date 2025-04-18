
import { useState } from "react";
import { Edit, Trash, Briefcase } from "lucide-react";
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
import { ReminderSection } from "./ReminderSection";
import { ReminderStatus } from "@/api/types/contacts";
import { contactMutations } from "@/api/services/contacts";
import { CONTACTS_QUERY_KEY } from "@/components/contacts/ContactsList";

type ReminderFrequency = 'Every week' | 'Every 2 weeks' | 'Monthly' | 'Every 2 months' | 'Every 3 months' | null;
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface ContactHeaderProps {
  contact: any;
  isEditing: boolean;
  editedContact: any;
  setEditedContact: (contact: any) => void;
  handleEdit: () => void;
  giftIdeas: string[];
  onAddGiftIdea: (idea: string) => void;
  selectedReminder: ReminderFrequency;
  onReminderSelect: (frequency: ReminderFrequency, preferredDay?: DayOfWeek) => void;
  isReminderLoading?: boolean;
  nextReminder?: Date | null;
  reminderStatus?: ReminderStatus;
  contactId: string;
}

export function ContactHeader({
  contact,
  isEditing,
  editedContact,
  setEditedContact,
  handleEdit,
  giftIdeas,
  onAddGiftIdea,
  selectedReminder,
  onReminderSelect,
  isReminderLoading,
  nextReminder,
  reminderStatus,
  contactId,
}: ContactHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(contact.friendship_score || 0);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      console.log('Deleting contact:', contactId);
      return contactMutations.delete(contactId);
    },
    onSuccess: () => {
      toast.success('Contact deleted successfully');
      // Invalidate both the specific contact query and the contacts list query
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
      
      // Wait for the query invalidation to be processed before navigating
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    },
    onError: (error) => {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
      setIsDeleting(false);
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setIsDeleting(true);
      try {
        await deleteMutation.mutateAsync();
      } catch (error) {
        // Error is handled in onError callback
        console.error("Delete mutation failed:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-start space-x-4">
          <img
            src={contact.avatar_url || "/placeholder.svg"}
            alt={contact.full_name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">{contact.full_name}</h1>
            
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
          <Button variant="outline" onClick={() => navigate(`/dashboard/contact/create?edit=${contact.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <TagsSection
        tags={contact.tags || []}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />

      <div className="flex items-center space-x-4">
        <GiftIdeasDropdown giftIdeas={giftIdeas} onAddGiftIdea={onAddGiftIdea} />
        <ReminderSection
          selectedReminder={selectedReminder}
          onReminderSelect={onReminderSelect}
          contactName={contact.full_name}
          isLoading={isReminderLoading}
          nextReminder={nextReminder}
          reminderStatus={reminderStatus}
          contactId={contactId}
          preferredDay={contact.preferred_reminder_day}
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Gift, Edit, Trash, Plus, Bell, Briefcase, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const [newGiftIdea, setNewGiftIdea] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const addTag = () => {
    if (newTag.trim()) {
      const updatedTags = [...(contact.tags || []), newTag.trim()];
      updateTagsMutation.mutate(updatedTags);
      setNewTag("");
      setIsAddingTag(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = (contact.tags || []).filter(tag => tag !== tagToRemove);
    updateTagsMutation.mutate(updatedTags);
  };

  const [score, setScore] = useState(contact.friendship_score || 0);

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

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg mt-2 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">Friendship Score</span>
                  <span className="text-sm text-green-600">{score}</span>
                </div>
                <Slider
                  value={[score]}
                  onValueChange={handleScoreChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {contact.relationship}
              </Badge>
              {contact.birthday && (
                <span className="text-sm text-gray-600">
                  🎂 {new Date(contact.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </span>
              )}
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

      <div className="flex flex-wrap gap-2 items-center">
        {(contact.tags || []).map((tag, index) => (
          <div key={index} className="relative group">
            <Badge variant="secondary" className="pr-6">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-gray-500 hover:text-gray-700" />
              </button>
            </Badge>
          </div>
        ))}
        {isAddingTag ? (
          <div className="flex items-center gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name"
              className="w-32"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTag();
                }
              }}
            />
            <Button size="sm" onClick={addTag}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAddingTag(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTag(true)}
            className="h-6"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Gift className="h-4 w-4 mr-2" />
              Gift Ideas ({giftIdeas.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add gift idea..."
                  value={newGiftIdea}
                  onChange={(e) => setNewGiftIdea(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onAddGiftIdea(newGiftIdea);
                      setNewGiftIdea("");
                    }
                  }}
                />
                <Button size="sm" onClick={() => {
                  onAddGiftIdea(newGiftIdea);
                  setNewGiftIdea("");
                }}>
                  Add
                </Button>
              </div>
            </div>
            {giftIdeas.map((idea, index) => (
              <DropdownMenuItem key={index}>{idea}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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

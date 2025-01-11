import { useState, useEffect } from "react";
import { Instagram, Linkedin, Twitter, Phone, Mail, Coffee, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tag } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ContactHeader } from "./profile/ContactHeader";
import { ContactInfo } from "./profile/ContactInfo";
import { ContactTimeline } from "./profile/ContactTimeline";
import { RelationshipCard } from "./profile/RelationshipCard";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export function ContactProfile() {
  const { id } = useParams();
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState<Date>();
  const queryClient = useQueryClient();
  
  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateFollowupMutation = useMutation({
    mutationFn: async (date: Date) => {
      const { error } = await supabase
        .from('contacts')
        .update({ scheduled_followup: date.toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      toast.success('Follow-up scheduled successfully');
    },
    onError: (error) => {
      toast.error('Failed to schedule follow-up');
      console.error('Error scheduling follow-up:', error);
    },
  });

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age + 1; // Add 1 to show the age they'll be turning this year
  };

  const handleScheduleFollowup = (selectedDate: Date) => {
    setDate(selectedDate);
    updateFollowupMutation.mutate(selectedDate);
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!contact) {
    return <div className="p-6">Contact not found</div>;
  }

  const mockTimeline = [
    { type: "call", date: "2024-03-15", description: "Phone Call", icon: <Phone className="h-4 w-4" /> },
    { type: "email", date: "2024-03-10", description: "Email Follow-up", icon: <Mail className="h-4 w-4" /> },
    { type: "meeting", date: "2024-03-01", description: "Coffee Meeting", icon: <Coffee className="h-4 w-4" /> },
  ];

  const mockRelatedContacts = [
    {
      name: "James Wilson",
      email: "james.w@gmail.com",
      avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=40&h=40&fit=crop",
    },
    {
      name: "Emma Thompson",
      email: "emma.t@gmail.com",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=40&h=40&fit=crop",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <ContactHeader
          contact={{
            ...contact,
            name: contact.full_name,
            title: contact.status || '',
            avatar: contact.avatar_url ? `${supabase.storage.from('avatars').getPublicUrl(contact.avatar_url).data.publicUrl}` : '',
            relationship: "Contact",
            age: 0,
            tags: contact.tags || [],
            friendship_score: contact.friendship_score || 0,
          }}
          isEditing={isEditing}
          editedContact={editedContact}
          setEditedContact={setEditedContact}
          handleEdit={handleEdit}
          giftIdeas={contact.gift_ideas || []}
          onAddGiftIdea={handleAddGiftIdea}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContactInfo
            contact={{
              ...contact,
              name: contact.full_name,
              businessPhone: contact.business_phone,
              mobilePhone: contact.mobile_phone,
            }}
            isEditing={isEditing}
            editedContact={editedContact}
            setEditedContact={setEditedContact}
          />

          <Card>
            <CardHeader>
              <CardTitle>Contact Frequency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Last Contact:</p>
                <p className="text-lg font-semibold">
                  {contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'No contact yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Follow-up:</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">
                    {contact.scheduled_followup ? format(new Date(contact.scheduled_followup), 'PPP') : 'Not scheduled'}
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="ml-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Now
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && handleScheduleFollowup(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          <ContactTimeline timeline={mockTimeline} />

          <RelationshipCard
            friendshipScore={contact.friendship_score || 0}
            contactId={contact.id}
            relatedContacts={mockRelatedContacts}
          />
        </div>

        <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notes</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isNotesOpen ? "Hide" : "Show"}
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add your notes here..."
                    className="min-h-[200px]"
                    value={contact.notes || ''}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}
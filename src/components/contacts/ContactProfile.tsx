import { useState, useEffect } from "react";
import { Instagram, Linkedin, Twitter, Phone, Mail, Coffee, Calendar } from "lucide-react";
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
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, differenceInYears } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditedContact {
  name: string;
  title: string;
  email: string;
  businessPhone: string;
  mobilePhone: string;
  birthday: string;
}

export function ContactProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const queryClient = useQueryClient();
  
  console.log('ContactProfile mounted with ID:', id);

  const { data: contact, isLoading, error } = useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      console.log('Starting contact fetch for ID:', id);
      if (!id) {
        console.error('No contact ID provided');
        throw new Error('No contact ID provided');
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.error('No authenticated user found');
        throw new Error('Authentication required');
      }

      console.log('Fetching contact with query:', { id, userId: session.session.user.id });
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching contact:', error);
        throw error;
      }

      if (!data) {
        console.error('No contact found with ID:', id);
        toast.error('Contact not found');
        navigate('/');
        return null;
      }
      
      console.log('Contact data successfully fetched:', data);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    retry: 2,
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast.error('Failed to load contact information');
        navigate('/');
      }
    }
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

  const handleScheduleFollowup = (date: Date) => {
    updateFollowupMutation.mutate(date);
    setSelectedDate(undefined);
  };

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = differenceInYears(today, birthDate);
    const nextBirthday = new Date(birthDate);
    nextBirthday.setFullYear(today.getFullYear());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    return age + 1;
  };

  const [editedContact, setEditedContact] = useState<EditedContact>({
    name: '',
    title: '',
    email: '',
    businessPhone: '',
    mobilePhone: '',
    birthday: '',
  });

  useEffect(() => {
    console.log('Contact data changed:', contact);
    if (contact) {
      console.log('Updating edited contact state with:', contact);
      setEditedContact({
        name: contact.full_name || '',
        title: contact.status || '',
        email: contact.email || '',
        businessPhone: contact.business_phone || '',
        mobilePhone: contact.mobile_phone || '',
        birthday: contact.birthday || '',
      });
    }
  }, [contact]);

  const updateGiftIdeasMutation = useMutation({
    mutationFn: async (newGiftIdeas: string[]) => {
      console.log('Updating gift ideas:', newGiftIdeas);
      const { error } = await supabase
        .from('contacts')
        .update({ gift_ideas: newGiftIdeas })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating gift ideas:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      toast.success('Gift idea added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add gift idea');
      console.error('Error updating gift ideas:', error);
    },
  });

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleAddGiftIdea = (newIdea: string) => {
    if (!contact?.gift_ideas) return;
    console.log('Adding new gift idea:', newIdea);
    const updatedGiftIdeas = [...contact.gift_ideas, newIdea];
    updateGiftIdeasMutation.mutate(updatedGiftIdeas);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading contact information...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Contact Not Found</h2>
          <p className="text-muted-foreground">The contact you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/')}>Return to Contacts</Button>
        </div>
      </div>
    );
  }

  console.log('Rendering contact profile with data:', contact);

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
            age: contact.birthday ? calculateAge(contact.birthday) : undefined,
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
                    {contact.scheduled_followup 
                      ? format(new Date(contact.scheduled_followup), 'PPP')
                      : 'Not scheduled'}
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Now
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
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
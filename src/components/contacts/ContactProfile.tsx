import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, differenceInYears } from "date-fns";
import { Calendar, Phone, Mail, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { ContactHeader } from "./profile/ContactHeader";
import { ContactInfo } from "./profile/ContactInfo";
import { ContactTimeline } from "./profile/ContactTimeline";
import { RelationshipCard } from "./profile/RelationshipCard";
import { ReminderSection } from "./profile/ReminderSection";
import { useContactProfile } from "@/hooks/contacts/useContactProfile";
import { useUserProfile } from "@/hooks/contacts/useUserProfile";
import { useContactMutations } from "@/hooks/contacts/useContactMutations";

type ReminderFrequency = 'Every week' | 'Every 2 weeks' | 'Monthly' | null;

export function ContactProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedReminder, setSelectedReminder] = useState<ReminderFrequency>(null);
  const [editedContact, setEditedContact] = useState({
    name: '',
    title: '',
    email: '',
    businessPhone: '',
    mobilePhone: '',
    birthday: '',
  });

  const { data: userProfile } = useUserProfile();
  const { data: contact, isLoading, error } = useContactProfile(id);
  const { updateFollowupMutation, updateReminderMutation, updateGiftIdeasMutation } = useContactMutations(id || '');

  // Update selectedReminder when contact data is loaded
  useEffect(() => {
    if (contact?.reminder_frequency) {
      setSelectedReminder(contact.reminder_frequency as ReminderFrequency);
    }
  }, [contact?.reminder_frequency]);

  const handleScheduleFollowup = (date: Date) => {
    updateFollowupMutation.mutate(date);
    setSelectedDate(undefined);
    navigate(`/activities/create?participant=${encodeURIComponent(contact.full_name)}&date=${encodeURIComponent(date.toISOString())}`);
  };

  const handleReminderSelect = (frequency: ReminderFrequency) => {
    console.log('Selected reminder frequency:', frequency);
    setSelectedReminder(frequency);
    if (!userProfile?.calendar_id) {
      toast.error('Please set up your calendar ID in the calendar settings first');
      return;
    }
    updateReminderMutation.mutate({ 
      reminderFrequency: frequency,
      calendarId: userProfile.calendar_id,
      contactName: contact.full_name
    });
  };

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
    console.log('Loading contact data...');
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    console.error('Error in contact profile:', error);
    return <div className="p-6">Error loading contact information</div>;
  }

  if (!contact) {
    console.error('No contact data available');
    return <div className="p-6">Contact not found</div>;
  }

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    return differenceInYears(today, birthDate);
  };

  const mockTimeline = [
    { 
      type: "call", 
      date: "2024-03-15", 
      description: "Phone Call",
      icon: <Phone className="w-4 h-4" />
    },
    { 
      type: "email", 
      date: "2024-03-10", 
      description: "Email Follow-up",
      icon: <Mail className="w-4 h-4" />
    },
    { 
      type: "meeting", 
      date: "2024-03-01", 
      description: "Coffee Meeting",
      icon: <Coffee className="w-4 h-4" />
    },
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
            avatar: contact.avatar_url,
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

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Last Contact:</p>
              <p className="text-lg font-semibold">
                {contact.last_contact ? format(new Date(contact.last_contact), 'PPP') : 'No contact yet'}
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
          </div>

          <ContactTimeline timeline={mockTimeline} />
          <RelationshipCard
            friendshipScore={contact.friendship_score || 0}
            contactId={contact.id}
            relatedContacts={mockRelatedContacts}
          />
        </div>

        <ReminderSection
          selectedReminder={selectedReminder}
          onReminderSelect={handleReminderSelect}
          contactName={contact.full_name}
          isLoading={updateReminderMutation.isPending}
        />
      </div>
    </div>
  );
}
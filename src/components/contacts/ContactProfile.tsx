import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { ContactHeader } from "./profile/ContactHeader";
import { ContactInfo } from "./profile/ContactInfo";
import { NotesSection } from "./profile/NotesSection";
import { RelationshipCard } from "./profile/RelationshipCard";
import { useContactProfile } from "@/hooks/contacts/useContactProfile";
import { useUserProfile } from "@/hooks/contacts/useUserProfile";
import { useContactMutations } from "@/hooks/contacts/useContactMutations";
import { Contact, ReminderStatus } from "@/api/types/contacts";
import { getNoteContent } from "@/api/types/contacts";
import { ReminderFrequency, DayOfWeek } from "@/api/types/reminders";

interface EditedContact {
  full_name: string;
  title: string;
  email: string;
  business_phone: string;
  mobile_phone: string;
  birthday: string;
}

export function ContactProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedReminder, setSelectedReminder] = useState<ReminderFrequency>(null);
  const [preferredDay, setPreferredDay] = useState<DayOfWeek>();
  const [editedContact, setEditedContact] = useState<EditedContact>({
    full_name: '',
    title: '',
    email: '',
    business_phone: '',
    mobile_phone: '',
    birthday: '',
  });

  const { data: userProfile } = useUserProfile();
  const { data: contact, isLoading, error } = useContactProfile(id);
  const { updateFollowupMutation, updateReminderMutation, updateGiftIdeasMutation } = useContactMutations(id || '');

  useEffect(() => {
    if (contact?.reminder_frequency) {
      setSelectedReminder(contact.reminder_frequency as ReminderFrequency);
      setPreferredDay(contact.preferred_reminder_day as DayOfWeek);
    }
  }, [contact?.reminder_frequency, contact?.preferred_reminder_day]);

  const handleScheduleFollowup = (date: Date) => {
    updateFollowupMutation.mutate(date);
    setSelectedDate(undefined);
    navigate(`/activities/create?participant=${encodeURIComponent(contact.full_name)}&date=${encodeURIComponent(date.toISOString())}`);
  };

  const handleReminderSelect = (frequency: ReminderFrequency, day?: DayOfWeek) => {
    console.log('Selected reminder:', { frequency, day });
    setSelectedReminder(frequency);
    setPreferredDay(day);
    
    if (!userProfile?.calendar_id) {
      toast.error('Please set up your calendar ID in the calendar settings first');
      return;
    }
    
    updateReminderMutation.mutate({ 
      reminderFrequency: frequency,
      calendarId: userProfile.calendar_id,
      contactName: contact.full_name,
      preferredDay: day
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <ContactHeader
          contact={contact}
          isEditing={isEditing}
          editedContact={editedContact}
          setEditedContact={setEditedContact}
          handleEdit={handleEdit}
          giftIdeas={contact.gift_ideas || []}
          onAddGiftIdea={handleAddGiftIdea}
          selectedReminder={selectedReminder}
          onReminderSelect={handleReminderSelect}
          isReminderLoading={updateReminderMutation.isPending}
          nextReminder={contact.next_reminder ? new Date(contact.next_reminder) : null}
          reminderStatus={(contact.reminder_status as ReminderStatus) || 'pending'}
          contactId={contact.id}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContactInfo
            contact={contact}
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

          <NotesSection 
            contactId={contact.id} 
            initialNotes={getNoteContent(contact.notes)} 
          />
          <RelationshipCard
            friendshipScore={contact.friendship_score || 0}
            contactId={contact.id}
          />
        </div>
      </div>
    </div>
  );
}

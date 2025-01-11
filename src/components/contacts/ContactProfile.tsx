import { useState, useEffect } from "react";
import { Instagram, Linkedin, Twitter, Phone, Mail, Coffee } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";

export function ContactProfile() {
  const { id } = useParams();
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
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
  });

  const [editedContact, setEditedContact] = useState({
    name: '',
    title: '',
    email: '',
    businessPhone: '',
    mobilePhone: '',
    birthday: '',
  });

  useEffect(() => {
    if (contact) {
      setEditedContact({
        name: contact.full_name,
        title: contact.status || '',
        email: contact.email || '',
        businessPhone: contact.business_phone || '',
        mobilePhone: contact.mobile_phone || '',
        birthday: contact.birthday || '',
      });
    }
  }, [contact]);

  const handleEdit = () => {
    setIsEditing(!isEditing);
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
          }}
          isEditing={isEditing}
          editedContact={editedContact}
          setEditedContact={setEditedContact}
          handleEdit={handleEdit}
          giftIdeas={[]}
          setGiftIdeas={() => {}}
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
                <p className="text-sm text-gray-600">Next Check-up:</p>
                <p className="text-lg font-semibold flex items-center">
                  Coming soon
                  <span className="ml-2 text-green-600 text-sm">Not scheduled</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <ContactTimeline timeline={mockTimeline} />
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
                  <div className="flex space-x-2">
                    {["Personal", "Work", "Follow-up"].map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Top Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Friend", "Work", "Family"].map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <RelationshipCard
          friendshipScore={90}
          relatedContacts={mockRelatedContacts}
        />
      </div>
    </div>
  );
}
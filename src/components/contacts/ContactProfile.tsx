import { useState } from "react";
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

const mockContact = {
  id: 1,
  name: "Olivia Anderson",
  title: "Product Designer",
  relationship: "Close Friend",
  birthday: "March 15",
  age: 31,
  email: "oliviaanderson12@gmail.com",
  businessPhone: "+1 555-0123",
  mobilePhone: "+1 555-0124",
  avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=80&h=80&fit=crop",
  upcomingEvents: [
    { icon: "☕", name: "Coffee Meetup", time: "Monday, 10:00 AM" },
    { icon: "📞", name: "Check-up Call", time: "Wednesday, 2:00 PM" },
  ],
  friendshipScore: 90,
  relatedContacts: [
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
  ],
  notes: "",
  giftIdeas: ["Vintage Wine Collection 🍷", "Spa Day Package 💆‍♀️"],
  timeline: [
    { type: "call", date: "2024-03-15", description: "Phone Call", icon: <Phone className="h-4 w-4" /> },
    { type: "email", date: "2024-03-10", description: "Email Follow-up", icon: <Mail className="h-4 w-4" /> },
    { type: "meeting", date: "2024-03-01", description: "Coffee Meeting", icon: <Coffee className="h-4 w-4" /> },
  ],
  tags: ["Mentor", "Tech Industry", "Book Club"],
  socialMedia: {
    linkedin: "https://linkedin.com/in/olivia",
    twitter: "https://twitter.com/olivia",
    instagram: "https://instagram.com/olivia"
  },
  lastContact: "March 15, 2024",
  nextCheckup: "April 15, 2024",
  checkupInterval: "2 weeks",
};

export function ContactProfile() {
  const [giftIdeas, setGiftIdeas] = useState(mockContact.giftIdeas);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState({
    name: mockContact.name,
    title: mockContact.title,
    email: mockContact.email,
    businessPhone: mockContact.businessPhone,
    mobilePhone: mockContact.mobilePhone,
    birthday: mockContact.birthday,
  });

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <ContactHeader
          contact={mockContact}
          isEditing={isEditing}
          editedContact={editedContact}
          setEditedContact={setEditedContact}
          handleEdit={handleEdit}
          giftIdeas={giftIdeas}
          setGiftIdeas={setGiftIdeas}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContactInfo
            contact={mockContact}
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
                <p className="text-lg font-semibold">{mockContact.lastContact} (Phone Call)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Check-up:</p>
                <p className="text-lg font-semibold flex items-center">
                  {mockContact.nextCheckup}
                  <span className="ml-2 text-green-600 text-sm">In {mockContact.checkupInterval}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <ContactTimeline timeline={mockContact.timeline} />
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
              {mockContact.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <RelationshipCard
          friendshipScore={mockContact.friendshipScore}
          relatedContacts={mockContact.relatedContacts}
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  Gift,
  Save,
  Plus,
  Edit,
  Trash,
  Phone,
  Mail,
  Coffee,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
};

export function ContactProfile() {
  const [giftIdeas, setGiftIdeas] = useState(mockContact.giftIdeas);
  const [newGiftIdea, setNewGiftIdea] = useState("");

  const addGiftIdea = () => {
    if (newGiftIdea.trim()) {
      setGiftIdeas([...giftIdeas, newGiftIdea.trim()]);
      setNewGiftIdea("");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <img
              src={mockContact.avatar}
              alt={mockContact.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold">{mockContact.name}</h1>
              <p className="text-gray-600">{mockContact.title}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {mockContact.relationship}
                </Badge>
                <span className="text-sm text-gray-600">
                  🎂 {mockContact.birthday} (turns {mockContact.age + 1})
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{mockContact.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{mockContact.businessPhone} (Business)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{mockContact.mobilePhone} (Mobile)</span>
              </div>
            </CardContent>
          </Card>

          {/* Up Next Section */}
          <Card>
            <CardHeader>
              <CardTitle>Up Next</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockContact.upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-xl">{event.icon}</span>
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Friendship Score */}
          <Card>
            <CardHeader>
              <CardTitle>Friendship Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {mockContact.friendshipScore}
                </div>
                <p className="text-gray-600">Strong Connection</p>
              </div>
            </CardContent>
          </Card>

          {/* Who Knows Whom */}
          <Card>
            <CardHeader>
              <CardTitle>Who Knows Whom</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockContact.relatedContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Remove Connection</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add your notes here..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        {/* Gift Ideas Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Gift Ideas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add gift idea..."
                  value={newGiftIdea}
                  onChange={(e) => setNewGiftIdea(e.target.value)}
                />
                <Button size="sm" onClick={addGiftIdea}>
                  Add
                </Button>
              </div>
            </div>
            {giftIdeas.map((idea, index) => (
              <DropdownMenuItem key={index}>{idea}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
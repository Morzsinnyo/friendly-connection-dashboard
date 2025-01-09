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
  Bell,
  FileText,
  Link,
  Tag,
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
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  },
  lastContact: "March 15, 2024",
  nextCheckup: "April 15, 2024",
  checkupInterval: "2 weeks",
};

export function ContactProfile() {
  const [giftIdeas, setGiftIdeas] = useState(mockContact.giftIdeas);
  const [newGiftIdea, setNewGiftIdea] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(true);

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
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
              <div className="flex items-center space-x-2 mt-2">
                {Object.entries(mockContact.socialMedia).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Link className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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

          {/* Contact Frequency */}
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

          {/* Timeline */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockContact.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      {event.icon}
                    </div>
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-gray-600">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes Section with Categories */}
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

        {/* Custom Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockContact.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Friendship Score with Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Relationship Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Friendship Score</span>
                <span className="text-sm text-gray-600">{mockContact.friendshipScore}%</span>
              </div>
              <Progress value={mockContact.friendshipScore} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">Strong Connection</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Search, Import, Filter, Grid, List, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const mockContacts = [
  {
    id: 1,
    name: "Olivia Anderson",
    email: "oliviaanderson12@gmail.com",
    phone: "+62 85292410704",
    status: "Family Member",
    lastContact: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=40&h=40&fit=crop",
  },
  {
    id: 2,
    name: "James Wilson",
    email: "james.wilson@gmail.com",
    phone: "+1 555-0123",
    status: "Close Friend",
    lastContact: "2024-01-20",
    avatar: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=40&h=40&fit=crop",
  },
  {
    id: 3,
    name: "Emma Thompson",
    email: "emma.t@gmail.com",
    phone: "+44 20 7123 4567",
    status: "Business Contact",
    lastContact: "2024-01-25",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=40&h=40&fit=crop",
  },
  {
    id: 4,
    name: "Michael Chen",
    email: "m.chen@gmail.com",
    phone: "+86 10 8765 4321",
    status: "Family Member",
    lastContact: "2024-01-28",
    avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=40&h=40&fit=crop",
  },
  {
    id: 5,
    name: "Sophie Martin",
    email: "sophie.m@gmail.com",
    phone: "+33 1 23 45 67 89",
    status: "Close Friend",
    lastContact: "2024-01-30",
    avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=40&h=40&fit=crop",
  },
];

export function ContactsList() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Import className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            >
              {viewMode === "list" ? (
                <Grid className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </Button>
            <Select defaultValue="name">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="lastContact">Last Contact Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Profile</th>
                  <th className="text-left p-4">Contact Information</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Last Contact</th>
                  <th className="text-left p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b last:border-b-0">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{contact.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          {contact.email}
                        </span>
                        <span className="text-sm text-gray-600">
                          {contact.phone}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {contact.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {contact.lastContact}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/contact/${contact.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
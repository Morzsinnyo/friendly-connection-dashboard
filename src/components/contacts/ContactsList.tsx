import { useState, useEffect } from "react";
import { Search, Import, Filter, Grid, List, ChevronRight, Plus } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id: string;
  full_name: string;
  email: string;
  business_phone: string;
  mobile_phone: string;
  status: string;
  last_contact: string;
  avatar_url: string;
}

export function ContactsList() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("full_name");

      if (error) {
        console.error("Error fetching contacts:", error);
        return;
      }

      setContacts(data || []);
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <Button 
              variant="default"
              onClick={() => navigate("/contact/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
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
                        {contact.avatar_url ? (
                          <img
                            src={`${supabase.storage.from('avatars').getPublicUrl(contact.avatar_url).data.publicUrl}`}
                            alt={contact.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {contact.full_name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium">{contact.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          {contact.email}
                        </span>
                        <span className="text-sm text-gray-600">
                          {contact.business_phone || contact.mobile_phone}
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
                        {contact.last_contact}
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
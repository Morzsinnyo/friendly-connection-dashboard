import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, ChevronRight, Plus } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Contact {
  id: string;
  full_name: string;
  email: string;
  business_phone: string;
  mobile_phone: string;
  status: string;
  last_contact: string;
  avatar_url: string;
  company: string;
  job_title: string;
  tags: string[];
}

export function ContactsList() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
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

      // Extract unique statuses and companies
      const statuses = [...new Set(data?.map(contact => contact.status).filter(Boolean))];
      const companies = [...new Set(data?.map(contact => contact.company).filter(Boolean))];
      
      setAvailableStatuses(statuses);
      setAvailableCompanies(companies);
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus.length === 0 || 
      (contact.status && filterStatus.includes(contact.status));

    const matchesCompany = filterCompany.length === 0 || 
      (contact.company && filterCompany.includes(contact.company));

    return matchesSearch && matchesStatus && matchesCompany;
  });

  const handleContactClick = (contactId: string) => {
    navigate(`/contact/${contactId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="default"
              onClick={() => navigate("/contact/create")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Contacts</SheetTitle>
                  <SheetDescription>
                    Select criteria to filter your contacts
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-4">
                    <Label>Status</Label>
                    <div className="space-y-2">
                      {availableStatuses.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={filterStatus.includes(status)}
                            onCheckedChange={(checked) => {
                              setFilterStatus(prev =>
                                checked
                                  ? [...prev, status]
                                  : prev.filter(s => s !== status)
                              );
                            }}
                          />
                          <label
                            htmlFor={`status-${status}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Company</Label>
                    <div className="space-y-2">
                      {availableCompanies.map((company) => (
                        <div key={company} className="flex items-center space-x-2">
                          <Checkbox
                            id={`company-${company}`}
                            checked={filterCompany.includes(company)}
                            onCheckedChange={(checked) => {
                              setFilterCompany(prev =>
                                checked
                                  ? [...prev, company]
                                  : prev.filter(c => c !== company)
                              );
                            }}
                          />
                          <label
                            htmlFor={`company-${company}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {company}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="border-border hover:bg-muted"
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

        <div className="bg-card rounded-lg shadow-md border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Profile</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Contact Information</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Last Contact</th>
                  <th className="text-left p-4 text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className="border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleContactClick(contact.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {contact.avatar_url ? (
                          <img
                            src={`${supabase.storage.from('avatars').getPublicUrl(contact.avatar_url).data.publicUrl}`}
                            alt={contact.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            {contact.full_name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-foreground">{contact.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">
                          {contact.email}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {contact.business_phone || contact.mobile_phone}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {contact.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {contact.last_contact}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactClick(contact.id);
                        }}
                        className="hover:bg-muted"
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
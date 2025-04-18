import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, ChevronRight, Plus, Check, X, Bell } from "lucide-react";
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
import { useContactStatus } from "@/hooks/contacts/useContactStatus";
import { toast } from "sonner";
import { Contact } from "@/api/types/contacts";
import { ImportContactsButton } from './import/ImportContactsButton';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { contactQueries } from "@/api/services/contacts/queries";

export const CONTACTS_QUERY_KEY = ["contacts"];

export function ContactsList() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterCompany, setFilterCompany] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: async () => {
      const result = await contactQueries.getAll();
      if (result.error) {
        throw result.error;
      }
      return result.data || [];
    }
  });

  useEffect(() => {
    if (data) {
      const statuses = [...new Set(data?.map(contact => contact.status).filter(Boolean))];
      const companies = [...new Set(data?.map(contact => contact.company).filter(Boolean))];
      const tags = [...new Set(data?.flatMap(contact => contact.tags || []).filter(Boolean))];
      
      setAvailableStatuses(statuses);
      setAvailableCompanies(companies);
      setAvailableTags(tags);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts");
    }
  }, [error]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'business contact':
        return 'bg-[#F2FCE2] text-green-800';
      case 'personal contact':
        return 'bg-[#D3E4FD] text-blue-800';
      case 'family':
        return 'bg-[#E5DEFF] text-purple-800';
      case 'friend':
        return 'bg-[#FEC6A1] text-orange-800';
      default:
        return 'bg-[#FFDEE2] text-pink-800';
    }
  };

  const getReminderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'skipped':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getReminderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'skipped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredContacts = (data || []).filter(contact => {
    const matchesSearch = 
      contact.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus.length === 0 || 
      (contact.status && filterStatus.includes(contact.status));

    const matchesCompany = filterCompany.length === 0 || 
      (contact.company && filterCompany.includes(contact.company));

    const matchesTags = filterTags.length === 0 ||
      (contact.tags && contact.tags.some(tag => filterTags.includes(tag)));

    return matchesSearch && matchesStatus && matchesCompany && matchesTags;
  });

  const handleContactClick = (contactId: string) => {
    console.log("[ContactsList] Navigating to contact profile:", contactId);
    navigate(`/dashboard/contact/${contactId}`);
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
            <ImportContactsButton />
            <Button 
              variant="default"
              onClick={() => {
                console.log("[ContactsList] Navigating to create contact");
                navigate("/dashboard/contact/create");
              }}
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
                  <div className="space-y-4">
                    <Label>Tags</Label>
                    <div className="space-y-2">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={filterTags.includes(tag)}
                            onCheckedChange={(checked) => {
                              setFilterTags(prev =>
                                checked
                                  ? [...prev, tag]
                                  : prev.filter(t => t !== tag)
                              );
                            }}
                          />
                          <label
                            htmlFor={`tag-${tag}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {tag}
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

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Loading contacts...</p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-md border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-muted-foreground font-medium">Profile</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Contact Information</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Reminder Status</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Last Contact</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
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
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(contact.status)}
                          >
                            {contact.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getReminderStatusIcon(contact.reminder_status)}
                            <Badge 
                              variant="secondary" 
                              className={getReminderStatusColor(contact.reminder_status)}
                            >
                              {contact.reminder_status.charAt(0).toUpperCase() + contact.reminder_status.slice(1)}
                            </Badge>
                          </div>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        {searchQuery || filterStatus.length > 0 || filterCompany.length > 0 || filterTags.length > 0 ? 
                          "No contacts match your search or filters" : 
                          "No contacts found. Import or create a new contact to get started."
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Contact } from "@/api/types/contacts";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ContactPreviewListProps {
  contacts: Partial<Contact>[];
  onContactsSelected: (selectedIds: string[]) => void;
}

export function ContactPreviewList({ contacts, onContactsSelected }: ContactPreviewListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleContact = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds(prev => 
      prev.length === filteredContacts.length 
        ? [] 
        : filteredContacts.map(c => c.id!).filter(Boolean)
    );
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.full_name?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.mobile_phone?.includes(searchQuery) ||
      contact.business_phone?.includes(searchQuery) ||
      contact.company?.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onContactsSelected(selectedIds);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
            onCheckedChange={toggleAll}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All
          </label>
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedIds.length} of {filteredContacts.length} selected
        </p>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="space-y-2 p-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center space-x-4 rounded-lg border p-4"
            >
              <Checkbox
                id={contact.id}
                checked={selectedIds.includes(contact.id!)}
                onCheckedChange={() => toggleContact(contact.id!)}
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{contact.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {contact.email || contact.mobile_phone || contact.business_phone}
                </p>
                {contact.company && (
                  <p className="text-xs text-muted-foreground">
                    {contact.company} {contact.job_title ? `• ${contact.job_title}` : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
          {filteredContacts.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No contacts found
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={() => onContactsSelected([])}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          disabled={selectedIds.length === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Importing...' : `Import Selected (${selectedIds.length})`}
        </Button>
      </div>
    </div>
  );
}

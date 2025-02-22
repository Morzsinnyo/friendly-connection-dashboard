
import { Button } from "@/components/ui/button";
import { Contact } from "@/api/types/contacts";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ContactPreviewListProps {
  contacts: Partial<Contact>[];
  onContactsSelected: (selectedIds: string[]) => void;
}

export function ContactPreviewList({ contacts, onContactsSelected }: ContactPreviewListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleContact = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds(prev => 
      prev.length === contacts.length 
        ? [] 
        : contacts.map(c => c.id!).filter(Boolean)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedIds.length === contacts.length}
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
          {selectedIds.length} of {contacts.length} selected
        </p>
      </div>

      <div className="space-y-2">
        {contacts.map((contact) => (
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
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          disabled={selectedIds.length === 0}
          onClick={() => onContactsSelected(selectedIds)}
        >
          Continue with Selected ({selectedIds.length})
        </Button>
      </div>
    </div>
  );
}

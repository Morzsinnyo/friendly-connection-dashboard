import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SocialMediaIcons } from "./SocialMediaIcons";
import { Contact } from "@/api/types/contacts";

interface ContactInfoProps {
  contact: Contact;
  isEditing: boolean;
  editedContact: any;
  setEditedContact: (contact: any) => void;
}

export function ContactInfo({
  contact,
  isEditing,
  editedContact,
  setEditedContact,
}: ContactInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          {isEditing ? (
            <Input
              value={editedContact.email}
              onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
            />
          ) : (
            <span>{contact.email}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          {isEditing ? (
            <Input
              value={editedContact.business_phone}
              onChange={(e) => setEditedContact({ ...editedContact, business_phone: e.target.value })}
            />
          ) : (
            <span>{contact.business_phone} (Business)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          {isEditing ? (
            <Input
              value={editedContact.mobile_phone}
              onChange={(e) => setEditedContact({ ...editedContact, mobile_phone: e.target.value })}
            />
          ) : (
            <span>{contact.mobile_phone} (Mobile)</span>
          )}
        </div>
        <div className="pt-2 border-t">
          <SocialMediaIcons contact={contact} />
        </div>
      </CardContent>
    </Card>
  );
}
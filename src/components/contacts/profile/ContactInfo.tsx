import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ContactInfoProps {
  contact: any;
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
              value={editedContact.businessPhone}
              onChange={(e) => setEditedContact({ ...editedContact, businessPhone: e.target.value })}
            />
          ) : (
            <span>{contact.businessPhone} (Business)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-gray-400" />
          {isEditing ? (
            <Input
              value={editedContact.mobilePhone}
              onChange={(e) => setEditedContact({ ...editedContact, mobilePhone: e.target.value })}
            />
          ) : (
            <span>{contact.mobilePhone} (Mobile)</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
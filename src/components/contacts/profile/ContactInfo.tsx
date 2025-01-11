import { Mail, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { differenceInYears, getYear } from "date-fns";

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
  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = differenceInYears(today, birthDate);
    const nextBirthday = new Date(birthDate);
    nextBirthday.setFullYear(getYear(today));
    if (nextBirthday < today) {
      nextBirthday.setFullYear(getYear(today) + 1);
    }
    return age;
  };

  const age = calculateAge(contact.birthday);

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
        {contact.birthday && (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <span>{new Date(contact.birthday).toLocaleDateString()}</span>
              {age && (
                <span className="ml-2 text-sm text-gray-600">
                  (Turning {age + 1} this year)
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
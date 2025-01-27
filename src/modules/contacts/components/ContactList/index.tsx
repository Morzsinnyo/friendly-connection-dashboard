import { Contact } from "@/api/types/contacts";
import { useContactState } from "../../hooks/useContactState";
import { LoadingState } from "@/components/common/LoadingState";

export const ContactList = () => {
  const { contacts, isLoading } = useContactState();

  if (isLoading) {
    return <LoadingState message="Loading contacts..." />;
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact: Contact) => (
        <div key={contact.id} className="p-4 border rounded-lg">
          <h3 className="font-medium">{contact.full_name}</h3>
          {contact.email && (
            <p className="text-sm text-gray-500">{contact.email}</p>
          )}
        </div>
      ))}
    </div>
  );
};
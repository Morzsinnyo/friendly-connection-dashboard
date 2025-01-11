import { useState } from "react";
import { Gift, Edit, Trash, Plus, Bell, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactHeaderProps {
  contact: any;
  isEditing: boolean;
  editedContact: any;
  setEditedContact: (contact: any) => void;
  handleEdit: () => void;
  giftIdeas: string[];
  onAddGiftIdea: (idea: string) => void;
}

export function ContactHeader({
  contact,
  isEditing,
  editedContact,
  setEditedContact,
  handleEdit,
  giftIdeas,
  onAddGiftIdea,
}: ContactHeaderProps) {
  const [newGiftIdea, setNewGiftIdea] = useState("");

  const addGiftIdea = () => {
    if (newGiftIdea.trim()) {
      onAddGiftIdea(newGiftIdea.trim());
      setNewGiftIdea("");
    }
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const nextBirthday = new Date(birthDate);
    nextBirthday.setFullYear(today.getFullYear() + (m < 0 ? 0 : 1));
    return { currentAge: age, nextAge: age + 1 };
  };

  const ageInfo = contact.birthday ? calculateAge(contact.birthday) : null;

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-start space-x-4">
        <img
          src={contact.avatar || "/placeholder.svg"}
          alt={contact.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          {isEditing ? (
            <Input
              value={editedContact.name}
              onChange={(e) => setEditedContact({ ...editedContact, name: e.target.value })}
              className="text-2xl font-bold mb-2"
            />
          ) : (
            <h1 className="text-2xl font-bold">{contact.name}</h1>
          )}
          
          {(contact.job_title || contact.company) && (
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Briefcase className="h-4 w-4" />
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editedContact.jobTitle}
                    onChange={(e) => setEditedContact({ ...editedContact, jobTitle: e.target.value })}
                    placeholder="Job Title"
                    className="text-sm"
                  />
                  <Input
                    value={editedContact.company}
                    onChange={(e) => setEditedContact({ ...editedContact, company: e.target.value })}
                    placeholder="Company"
                    className="text-sm"
                  />
                </div>
              ) : (
                <span>
                  {contact.job_title} {contact.job_title && contact.company && "at"} {contact.company}
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {contact.relationship}
            </Badge>
            {contact.birthday && (
              <span className="text-sm text-gray-600">
                🎂 {new Date(contact.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                {ageInfo && ` (turns ${ageInfo.nextAge})`}
              </span>
            )}
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Gift className="h-4 w-4 mr-2" />
                    Gift Ideas ({giftIdeas.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add gift idea..."
                        value={newGiftIdea}
                        onChange={(e) => setNewGiftIdea(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addGiftIdea();
                          }
                        }}
                      />
                      <Button size="sm" onClick={addGiftIdea}>
                        Add
                      </Button>
                    </div>
                  </div>
                  {giftIdeas.map((idea, index) => (
                    <DropdownMenuItem key={index}>{idea}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Reminder
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Every week</DropdownMenuItem>
                  <DropdownMenuItem>Every 2 weeks</DropdownMenuItem>
                  <DropdownMenuItem>Monthly</DropdownMenuItem>
                  <DropdownMenuItem>Custom...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Save" : "Edit"}
        </Button>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
        <Button variant="destructive">
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
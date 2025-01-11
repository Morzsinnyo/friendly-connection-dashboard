import { useState } from "react";
import { Gift, Edit, Trash, Plus, Bell } from "lucide-react";
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
  setGiftIdeas: (ideas: string[]) => void;
}

export function ContactHeader({
  contact,
  isEditing,
  editedContact,
  setEditedContact,
  handleEdit,
  giftIdeas,
  setGiftIdeas,
}: ContactHeaderProps) {
  const [newGiftIdea, setNewGiftIdea] = useState("");

  const addGiftIdea = () => {
    if (newGiftIdea.trim()) {
      setGiftIdeas([...giftIdeas, newGiftIdea.trim()]);
      setNewGiftIdea("");
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-start space-x-4">
        <img
          src={contact.avatar}
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
          {isEditing ? (
            <Input
              value={editedContact.title}
              onChange={(e) => setEditedContact({ ...editedContact, title: e.target.value })}
              className="text-gray-600 mb-2"
            />
          ) : (
            <p className="text-gray-600">{contact.title}</p>
          )}
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {contact.relationship}
            </Badge>
            <span className="text-sm text-gray-600">
              🎂 {isEditing ? (
                <Input
                  value={editedContact.birthday}
                  onChange={(e) => setEditedContact({ ...editedContact, birthday: e.target.value })}
                  className="inline-block w-32"
                />
              ) : (
                `${contact.birthday} (turns ${contact.age + 1})`
              )}
            </span>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Gift className="h-4 w-4 mr-2" />
                    Gift Ideas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add gift idea..."
                        value={newGiftIdea}
                        onChange={(e) => setNewGiftIdea(e.target.value)}
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
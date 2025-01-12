import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface GiftIdeasDropdownProps {
  giftIdeas: string[];
  onAddGiftIdea: (idea: string) => void;
}

export function GiftIdeasDropdown({ giftIdeas, onAddGiftIdea }: GiftIdeasDropdownProps) {
  const [newGiftIdea, setNewGiftIdea] = useState("");

  const handleAddGiftIdea = () => {
    if (newGiftIdea.trim()) {
      onAddGiftIdea(newGiftIdea);
      setNewGiftIdea("");
    }
  };

  return (
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
                  handleAddGiftIdea();
                }
              }}
            />
            <Button size="sm" onClick={handleAddGiftIdea}>
              Add
            </Button>
          </div>
        </div>
        {giftIdeas.map((idea, index) => (
          <DropdownMenuItem key={index}>{idea}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
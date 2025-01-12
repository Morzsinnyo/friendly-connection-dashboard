import { Tag, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps) {
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag("");
      setIsAddingTag(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag, index) => (
        <div key={index} className="relative group">
          <Badge variant="secondary" className="pr-6">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-gray-500 hover:text-gray-700" />
            </button>
          </Badge>
        </div>
      ))}
      {isAddingTag ? (
        <div className="flex items-center gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter tag name"
            className="w-32"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTag();
              }
            }}
          />
          <Button size="sm" onClick={handleAddTag}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsAddingTag(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingTag(true)}
          className="h-6"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
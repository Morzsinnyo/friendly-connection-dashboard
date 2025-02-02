import { useState } from "react";
import { Tag, X, Plus, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { contactQueries } from "@/api/services/contacts/queries";
import { useQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/common/LoadingState";

interface TagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps) {
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [open, setOpen] = useState(false);

  console.log('Current tags:', tags);

  const { data: tagsResponse, isLoading, error } = useQuery({
    queryKey: ['uniqueTags'],
    queryFn: async () => {
      console.log('Fetching unique tags');
      const response = await contactQueries.getAllUniqueTags();
      console.log('Fetched tags response:', response);
      return response;
    },
  });

  const existingTags = tagsResponse?.data || [];

  const handleAddTag = (value: string) => {
    console.log('Adding tag:', value);
    if (value?.trim()) {
      onAddTag(value.trim());
      setNewTag("");
      setIsAddingTag(false);
      setOpen(false);
    }
  };

  if (error) {
    console.error('Error loading tags:', error);
    return <div>Error loading tags</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-muted-foreground">Tags</span>
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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {newTag || "Select tag..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search tag..."
                  value={newTag}
                  onValueChange={setNewTag}
                  className="h-9"
                />
                {isLoading ? (
                  <LoadingState message="Loading tags..." />
                ) : (
                  <>
                    <CommandEmpty>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleAddTag(newTag)}
                      >
                        Create "{newTag}"
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      {existingTags.map((tag) => (
                        <CommandItem
                          key={tag}
                          value={tag}
                          onSelect={() => handleAddTag(tag)}
                        >
                          {tag}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <Button size="sm" onClick={() => handleAddTag(newTag)}>
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
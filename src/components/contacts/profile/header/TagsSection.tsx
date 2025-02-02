import { useState } from "react";
import { Tag, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface TagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  console.log('Current tags:', tags);

  const { data: existingTags = [], isLoading } = useQuery({
    queryKey: ['uniqueTags'],
    queryFn: async () => {
      console.log('Fetching unique tags');
      const response = await contactQueries.getAllUniqueTags();
      console.log('Fetched tags:', response.data);
      return response.data;
    },
  });

  const handleSelect = (currentValue: string) => {
    console.log('Selected tag:', currentValue);
    onAddTag(currentValue);
    setInputValue("");
    setOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      handleSelect(inputValue);
    }
  };

  const filteredTags = existingTags
    .filter(tag => !tags.includes(tag))
    .filter(tag => 
      tag.toLowerCase().includes(inputValue.toLowerCase())
    );

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
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Type a tag..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleInputKeyDown}
              className="border-none focus:ring-0"
            />
            <CommandEmpty>
              {inputValue && (
                <button
                  className="w-full p-2 text-sm text-left hover:bg-accent"
                  onClick={() => handleSelect(inputValue)}
                >
                  Create tag "{inputValue}"
                </button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredTags.map((tag) => (
                <CommandItem
                  key={tag}
                  value={tag}
                  onSelect={() => handleSelect(tag)}
                  className="cursor-pointer"
                >
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
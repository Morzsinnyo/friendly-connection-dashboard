import { useState } from "react";
import { Tag, X, Plus, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface TagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function TagsSection({ tags, onAddTag, onRemoveTag }: TagsSectionProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

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
    setValue("");
    setOpen(false);
  };

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
            role="combobox"
            aria-expanded={open}
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tag
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or add tag..."
              value={value}
              onValueChange={setValue}
            />
            <CommandEmpty>
              {value && (
                <button
                  className="w-full p-2 text-sm text-left hover:bg-accent"
                  onClick={() => handleSelect(value)}
                >
                  Create tag "{value}"
                </button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {existingTags
                .filter(tag => !tags.includes(tag))
                .map((tag) => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={() => handleSelect(tag)}
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
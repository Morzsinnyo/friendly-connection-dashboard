import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoFieldsProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function BasicInfoFields({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: BasicInfoFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </>
  );
}
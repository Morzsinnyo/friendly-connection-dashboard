import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

interface ParticipantFieldsProps {
  participants: string;
  onParticipantsChange: (value: string) => void;
}

export function ParticipantFields({
  participants,
  onParticipantsChange,
}: ParticipantFieldsProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium flex items-center gap-2">
        <Users className="h-4 w-4" />
        With Whom?
      </label>
      <Input
        placeholder="Enter names separated by commas"
        value={participants}
        onChange={(e) => onParticipantsChange(e.target.value)}
      />
    </div>
  );
}
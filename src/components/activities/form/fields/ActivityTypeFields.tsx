import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityTypeFieldsProps {
  activityType: string;
  onActivityTypeChange: (value: string) => void;
}

const activityTypes = [
  { value: "in-person", label: "In Person" },
  { value: "phone", label: "Phone Call" },
  { value: "zoom", label: "Video Call" },
];

export function ActivityTypeFields({
  activityType,
  onActivityTypeChange,
}: ActivityTypeFieldsProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Activity Type</label>
      <Select value={activityType} onValueChange={onActivityTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {activityTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
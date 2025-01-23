import { Input } from "@/components/ui/input";

interface LocationFieldsProps {
  location: string;
  meetingLink: string;
  onLocationChange: (value: string) => void;
  onMeetingLinkChange: (value: string) => void;
}

export function LocationFields({
  location,
  meetingLink,
  onLocationChange,
  onMeetingLinkChange,
}: LocationFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium">
          Location (optional)
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="meetingLink" className="block text-sm font-medium">
          Meeting Link (optional)
        </label>
        <Input
          id="meetingLink"
          type="url"
          value={meetingLink}
          onChange={(e) => onMeetingLinkChange(e.target.value)}
        />
      </div>
    </>
  );
}
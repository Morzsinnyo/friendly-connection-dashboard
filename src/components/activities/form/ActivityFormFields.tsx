import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInYears } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  meetingLink: string;
  setMeetingLink: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  participants: string;
  setParticipants: (value: string) => void;
  activityType: string;
  setActivityType: (value: string) => void;
}

const activityTypes = [
  { value: "in-person", label: "In Person" },
  { value: "phone", label: "Phone Call" },
  { value: "zoom", label: "Video Call" },
];

export function ActivityFormFields({
  title,
  setTitle,
  description,
  setDescription,
  location,
  setLocation,
  meetingLink,
  setMeetingLink,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  participants,
  setParticipants,
  activityType,
  setActivityType,
}: ActivityFormFieldsProps) {
  const calculateAge = (date: Date) => {
    const today = new Date();
    return differenceInYears(today, date);
  };

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Activity Type</label>
        <Select value={activityType} onValueChange={setActivityType}>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Start Date & Time</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {startDate && (
            <p className="text-sm text-muted-foreground">
              Turns {calculateAge(startDate)} years old
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">End Date & Time</label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          With Whom?
        </label>
        <Input
          placeholder="Enter names separated by commas"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium">
          Location (optional)
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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
          onChange={(e) => setMeetingLink(e.target.value)}
        />
      </div>
    </>
  );
}
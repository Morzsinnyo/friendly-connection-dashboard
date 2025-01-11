import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

const colorOptions = [
  { label: "Blue", value: "#3b82f6" },
  { label: "Green", value: "#22c55e" },
  { label: "Purple", value: "#a855f7" },
  { label: "Red", value: "#ef4444" },
  { label: "Yellow", value: "#eab308" },
];

export function CreateEventModal({ isOpen, onClose, selectedDate }: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(selectedDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [guests, setGuests] = useState("");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colorOptions[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(":");
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(":");
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const guestList = guests.split(",").map(email => email.trim()).filter(email => email);

      const { error } = await supabase.from("events").insert([{
        user_id: user.id,
        title,
        description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        guests: guestList,
        meeting_link: meetingLink,
        color,
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guests">Guests (comma-separated emails)</Label>
              <Input
                id="guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                placeholder="guest1@example.com, guest2@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add event description"
              />
            </div>
            <div className="grid gap-2">
              <Label>Color Category</Label>
              <div className="flex gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === option.value ? "border-black" : "border-transparent"
                    }`}
                    style={{ backgroundColor: option.value }}
                    onClick={() => setColor(option.value)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
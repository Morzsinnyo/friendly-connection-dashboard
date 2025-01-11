import React from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const Calendar = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const [view, setView] = React.useState<"month" | "week" | "day">("month");
  const [showEventDialog, setShowEventDialog] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [newEvent, setNewEvent] = React.useState({
    title: "",
    startTime: "09:30",
    endTime: "10:00",
    guests: "",
    meetingLink: "https://meet.google.com/",
    description: "",
    color: "#4A90E2",
  });
  const { toast } = useToast();

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      console.log("Fetching events...");
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive",
        });
        throw error;
      }

      console.log("Events fetched:", data);
      return data;
    },
  });

  const handlePrevious = () => {
    const newDate = new Date(date);
    if (view === "month") {
      newDate.setMonth(date.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(date.getDate() - 7);
    } else {
      newDate.setDate(date.getDate() - 1);
    }
    setDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(date);
    if (view === "month") {
      newDate.setMonth(date.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(date.getDate() + 7);
    } else {
      newDate.setDate(date.getDate() + 1);
    }
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const handleCreateEvent = async () => {
    if (!selectedDate) return;

    const [startHour, startMinute] = newEvent.startTime.split(':');
    const [endHour, endMinute] = newEvent.endTime.split(':');
    
    const startTime = new Date(selectedDate);
    startTime.setHours(parseInt(startHour), parseInt(startMinute));
    
    const endTime = new Date(selectedDate);
    endTime.setHours(parseInt(endHour), parseInt(endMinute));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("events").insert([{
        user_id: user.id,
        title: newEvent.title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        description: newEvent.description,
        meeting_link: newEvent.meetingLink,
        color: newEvent.color,
        guests: newEvent.guests ? newEvent.guests.split(',').map(g => g.trim()) : [],
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setShowEventDialog(false);
      setNewEvent({
        title: "",
        startTime: "09:30",
        endTime: "10:00",
        guests: "",
        meetingLink: "https://meet.google.com/",
        description: "",
        color: "#4A90E2",
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const colorOptions = [
    { value: "#4A90E2", label: "Blue" },
    { value: "#7ED321", label: "Green" },
    { value: "#9013FE", label: "Purple" },
    { value: "#F5A623", label: "Orange" },
    { value: "#D0021B", label: "Red" },
  ];

  const Day = ({ displayMonth, ...props }: any) => (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div {...props}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDate(displayMonth);
              setShowEventDialog(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-2">
        <p className="text-sm">Click to add event</p>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-64 border-r p-4 bg-sidebar">
        <h2 className="font-semibold mb-4">Categories</h2>
        <div className="space-y-2">
          {colorOptions.map((color) => (
            <div key={color.value} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color.value }}
              />
              <span>{color.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <h2 className="text-xl font-semibold">
              {format(date, "MMMM yyyy")}
            </h2>
          </div>

          <Select value={view} onValueChange={(v: "month" | "week" | "day") => setView(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md"
            components={{
              Day
            }}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-muted-foreground">Loading events...</span>
          </div>
        ) : (
          <div className="mt-4">
            {events?.map((event) => (
              <div
                key={event.id}
                className="p-2 mb-2 rounded-md"
                style={{ backgroundColor: event.color || '#e2e8f0' }}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-sm">
                  {format(new Date(event.start_time), "p")} -{" "}
                  {format(new Date(event.end_time), "p")}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Schedule</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="New event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
                <span>→</span>
                <Input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
              <Input
                placeholder="Add guest (comma-separated emails)"
                value={newEvent.guests}
                onChange={(e) => setNewEvent({ ...newEvent, guests: e.target.value })}
              />
              <Input
                placeholder="Meeting link"
                value={newEvent.meetingLink}
                onChange={(e) => setNewEvent({ ...newEvent, meetingLink: e.target.value })}
              />
              <Textarea
                placeholder="Add description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    className={`w-6 h-6 rounded-full ${newEvent.color === color.value ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
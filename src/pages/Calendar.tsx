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
import { ChevronLeft, ChevronRight, Link, Users, AlignLeft } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";

const Calendar = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const [view, setView] = React.useState<"month" | "week" | "day">("month");
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery({
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

  const EventCreationHoverCard = ({ date }: { date: Date }) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="w-full h-full cursor-pointer" />
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <Input
            type="text"
            placeholder="New event title"
            className="border-0 p-0 text-lg font-medium focus-visible:ring-0"
          />
          
          <div className="text-sm text-muted-foreground">
            {format(date, "EEEE, MMM d")}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Input
              type="time"
              defaultValue="09:30"
              className="w-24"
            />
            <span>→</span>
            <Input
              type="time"
              defaultValue="10:00"
              className="w-24"
            />
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <Input
              type="text"
              placeholder="Add guest"
              className="border-0 p-0 focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Link className="h-4 w-4" />
            <Input
              type="url"
              placeholder="Add meeting link"
              className="border-0 p-0 focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <AlignLeft className="h-4 w-4" />
            <Input
              type="text"
              placeholder="Add description"
              className="border-0 p-0 focus-visible:ring-0"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <div className="w-6 h-6 rounded-full bg-blue-200 cursor-pointer hover:ring-2 ring-offset-2" />
            <div className="w-6 h-6 rounded-full bg-green-200 cursor-pointer hover:ring-2 ring-offset-2" />
            <div className="w-6 h-6 rounded-full bg-yellow-200 cursor-pointer hover:ring-2 ring-offset-2" />
            <div className="w-6 h-6 rounded-full bg-red-200 cursor-pointer hover:ring-2 ring-offset-2" />
            <div className="w-6 h-6 rounded-full bg-purple-200 cursor-pointer hover:ring-2 ring-offset-2" />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4 mt-4">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save</Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );

  return (
    <div className="flex h-full">
      {/* Left Sidebar */}
      <div className="w-64 border-r p-4 bg-sidebar">
        <h2 className="font-semibold mb-4">Categories</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Work</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Personal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Family</span>
          </div>
        </div>

        <h2 className="font-semibold mt-8 mb-4">Favorites</h2>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">No favorites yet</div>
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
              Day: ({ date: dayDate, ...props }) => {
                const { className, ...rest } = props;
                return (
                  <div className="relative w-full h-full">
                    <div className={className} {...rest} />
                    <EventCreationHoverCard date={dayDate} />
                  </div>
                );
              },
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
      </div>
    </div>
  );
};

export default Calendar;

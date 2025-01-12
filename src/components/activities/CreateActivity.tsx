import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const activityTypes = [
  { value: "in-person", label: "In Person" },
  { value: "phone", label: "Phone Call" },
  { value: "zoom", label: "Video Call" },
];

export function CreateActivity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [userId, setUserId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [participants, setParticipants] = useState("");
  const [activityType, setActivityType] = useState("");

  // Fetch activity data if in edit mode
  const { data: activityData } = useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    // Get the current user's ID when component mounts
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        navigate("/auth");
      }
    };

    getCurrentUser();
  }, [navigate]);

  // Populate form with activity data when in edit mode
  useEffect(() => {
    if (activityData) {
      const startDateTime = new Date(activityData.start_time);
      const endDateTime = new Date(activityData.end_time);

      setTitle(activityData.title);
      setDescription(activityData.description || "");
      setLocation(activityData.location || "");
      setMeetingLink(activityData.meeting_link || "");
      setStartDate(startDateTime);
      setEndDate(endDateTime);
      setStartTime(format(startDateTime, "HH:mm"));
      setEndTime(format(endDateTime, "HH:mm"));
      setParticipants(activityData.guests ? activityData.guests.join(", ") : "");
      setActivityType(activityData.color || "");
    }
  }, [activityData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create an activity",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combine date and time
      const startDateTime = new Date(startDate);
      const [startHours, startMinutes] = startTime.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(endDate);
      const [endHours, endMinutes] = endTime.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const eventData = {
        title,
        description,
        location,
        meeting_link: meetingLink,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        user_id: userId,
        guests: participants ? participants.split(',').map(p => p.trim()) : [],
        color: activityType,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Activity updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("events")
          .insert([eventData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Activity created successfully",
        });
      }

      navigate("/activities");
    } catch (error) {
      console.error("Error saving activity:", error);
      toast({
        title: "Error",
        description: "Failed to save activity",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {isEditMode ? 'Edit Activity' : 'Create New Activity'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate("/activities")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? 'Update Activity' : 'Create Activity'}
          </Button>
        </div>
      </form>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ActivityFormFields } from "./form/ActivityFormFields";
import { format } from "date-fns";

export function CreateActivity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const participantFromUrl = searchParams.get('participant');
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
  const [participants, setParticipants] = useState(participantFromUrl || "");
  const [activityType, setActivityType] = useState("");

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
        <ActivityFormFields
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          meetingLink={meetingLink}
          setMeetingLink={setMeetingLink}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          participants={participants}
          setParticipants={setParticipants}
          activityType={activityType}
          setActivityType={setActivityType}
        />

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
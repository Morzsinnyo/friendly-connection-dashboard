import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export interface ActivityFormState {
  title: string;
  description: string;
  location: string;
  meetingLink: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  participants: string;
  activityType: string;
}

export const useActivityForm = (id?: string, initialParticipant?: string | null, initialDate?: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  
  const [formState, setFormState] = useState<ActivityFormState>({
    title: "",
    description: "",
    location: "",
    meetingLink: "",
    startDate: initialDate ? new Date(initialDate) : undefined,
    endDate: initialDate ? new Date(initialDate) : undefined,
    startTime: "09:00",
    endTime: "10:00",
    participants: initialParticipant || "",
    activityType: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.startDate || !formState.endDate) {
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
      const startDateTime = new Date(formState.startDate);
      const [startHours, startMinutes] = formState.startTime.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(formState.endDate);
      const [endHours, endMinutes] = formState.endTime.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const eventData = {
        title: formState.title,
        description: formState.description,
        location: formState.location,
        meeting_link: formState.meetingLink,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        user_id: userId,
        guests: formState.participants ? formState.participants.split(',').map(p => p.trim()) : [],
        color: formState.activityType,
      };

      if (id) {
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

  const updateFormState = (updates: Partial<ActivityFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  return {
    formState,
    updateFormState,
    handleSubmit,
    userId,
  };
};
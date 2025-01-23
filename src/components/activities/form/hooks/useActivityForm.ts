import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { validateForm } from "@/utils/form/validation";
import { required, dateRange, url } from "@/utils/form/rules";

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

export interface ActivityFormErrors {
  title?: string[];
  description?: string[];
  meetingLink?: string[];
  dateRange?: string[];
}

export const useActivityForm = (id?: string, initialParticipant?: string | null, initialDate?: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ActivityFormErrors>({});
  
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

  const validateFormData = (): boolean => {
    const validationRules = {
      title: [required()],
      meetingLink: [url()],
      dateRange: [dateRange()]
    };

    const dateRangeValue = {
      start: formState.startDate,
      end: formState.endDate
    };

    const validationResults = validateForm(
      {
        title: formState.title,
        meetingLink: formState.meetingLink,
        dateRange: dateRangeValue
      },
      validationRules
    );

    const newErrors: ActivityFormErrors = {};
    let isValid = true;

    Object.entries(validationResults).forEach(([field, result]) => {
      if (!result.isValid) {
        newErrors[field as keyof ActivityFormErrors] = result.errors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
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
      const startDateTime = new Date(formState.startDate!);
      const [startHours, startMinutes] = formState.startTime.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(formState.endDate!);
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
    setErrors({}); // Clear errors when form is updated
  };

  return {
    formState,
    updateFormState,
    handleSubmit,
    userId,
    errors,
  };
};
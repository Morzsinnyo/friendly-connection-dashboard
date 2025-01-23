import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActivityForm } from "./hooks/useActivityForm";
import { ActivityDetailsSection } from "./sections/ActivityDetailsSection";
import { ActivityDateTimeSection } from "./sections/ActivityDateTimeSection";
import { ActivityParticipantsSection } from "./sections/ActivityParticipantsSection";
import { ActivityActions } from "./sections/ActivityActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingState } from "@/components/common/LoadingState";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const activityTypes = [
  { value: "in-person", label: "In Person" },
  { value: "phone", label: "Phone Call" },
  { value: "zoom", label: "Video Call" },
];

export function ActivityFormContainer() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const participantFromUrl = searchParams.get('participant');
  const dateFromUrl = searchParams.get('date');
  const isEditMode = !!id;
  const { handleError } = useErrorHandler();

  const { formState, updateFormState, handleSubmit } = useActivityForm(
    id,
    participantFromUrl,
    dateFromUrl
  );

  const { data: activityData, isLoading, error } = useQuery({
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

  if (error) {
    handleError(error);
  }

  if (isLoading) {
    return <LoadingState message="Loading activity details..." />;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">
          {isEditMode ? 'Edit Activity' : 'Create New Activity'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <ActivityDetailsSection
            title={formState.title}
            description={formState.description}
            onTitleChange={(value) => updateFormState({ title: value })}
            onDescriptionChange={(value) => updateFormState({ description: value })}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">Activity Type</label>
            <Select 
              value={formState.activityType} 
              onValueChange={(value) => updateFormState({ activityType: value })}
            >
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

          <ActivityDateTimeSection
            startDate={formState.startDate}
            endDate={formState.endDate}
            startTime={formState.startTime}
            endTime={formState.endTime}
            onStartDateChange={(date) => updateFormState({ startDate: date })}
            onEndDateChange={(date) => updateFormState({ endDate: date })}
            onStartTimeChange={(time) => updateFormState({ startTime: time })}
            onEndTimeChange={(time) => updateFormState({ endTime: time })}
          />

          <ActivityParticipantsSection
            participants={formState.participants}
            onParticipantsChange={(value) => updateFormState({ participants: value })}
          />

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium">
              Location (optional)
            </label>
            <Input
              id="location"
              value={formState.location}
              onChange={(e) => updateFormState({ location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="meetingLink" className="block text-sm font-medium">
              Meeting Link (optional)
            </label>
            <Input
              id="meetingLink"
              type="url"
              value={formState.meetingLink}
              onChange={(e) => updateFormState({ meetingLink: e.target.value })}
            />
          </div>

          <ActivityActions isEditMode={isEditMode} onSubmit={handleSubmit} />
        </form>
      </div>
    </ErrorBoundary>
  );
}
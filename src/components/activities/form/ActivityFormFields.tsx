import { BasicInfoFields } from "./fields/BasicInfoFields";
import { LocationFields } from "./fields/LocationFields";
import { ActivityTypeFields } from "./fields/ActivityTypeFields";
import { ParticipantFields } from "./fields/ParticipantFields";
import { ActivityDateTimeSection } from "./sections/ActivityDateTimeSection";

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
  return (
    <>
      <BasicInfoFields
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
      />

      <ActivityTypeFields
        activityType={activityType}
        onActivityTypeChange={setActivityType}
      />

      <ActivityDateTimeSection
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
      />

      <ParticipantFields
        participants={participants}
        onParticipantsChange={setParticipants}
      />

      <LocationFields
        location={location}
        meetingLink={meetingLink}
        onLocationChange={setLocation}
        onMeetingLinkChange={setMeetingLink}
      />
    </>
  );
}
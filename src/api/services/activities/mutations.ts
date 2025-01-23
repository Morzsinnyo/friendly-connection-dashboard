import { supabase } from "@/integrations/supabase/client";
import { ActivityInsert, ActivityUpdate } from "./types";
import { formatApiResponse } from "@/api/utils/response-formatting";

export async function createActivity(activity: ActivityInsert) {
  const query = supabase
    .from("events")
    .insert([activity]);

  return formatApiResponse(Promise.resolve(query));
}

export async function updateActivity(id: string, updates: ActivityUpdate) {
  const query = supabase
    .from("events")
    .update(updates)
    .eq('id', id);

  return formatApiResponse(Promise.resolve(query));
}

export async function deleteActivity(id: string) {
  const query = supabase
    .from("events")
    .delete()
    .eq('id', id);

  return formatApiResponse(Promise.resolve(query));
}

export async function updateActivityParticipants(id: string, participants: string[]) {
  const query = supabase
    .from("events")
    .update({ guests: participants })
    .eq('id', id);

  return formatApiResponse(Promise.resolve(query));
}

export async function updateActivityDateTime(
  id: string, 
  startTime: string, 
  endTime: string
) {
  const query = supabase
    .from("events")
    .update({ 
      start_time: startTime,
      end_time: endTime 
    })
    .eq('id', id);

  return formatApiResponse(Promise.resolve(query));
}
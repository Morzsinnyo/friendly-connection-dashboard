import { supabase } from "@/integrations/supabase/client";
import { Activity, ActivityFilters } from "./types";
import { formatApiResponse } from "@/api/utils/response-formatting";

export async function getAllActivities(filters?: ActivityFilters) {
  let query = supabase
    .from("events")
    .select("*");

  if (filters?.startDate) {
    query = query.gte('start_time', filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    query = query.lte('end_time', filters.endDate.toISOString());
  }

  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
  }

  if (filters?.participantId) {
    query = query.contains('guests', [filters.participantId]);
  }

  return formatApiResponse(Promise.resolve(query));
}

export async function getActivityById(id: string) {
  const query = supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  return formatApiResponse(Promise.resolve(query));
}

export async function getUpcomingActivities() {
  const now = new Date().toISOString();
  const query = supabase
    .from("events")
    .select("*")
    .gte('start_time', now)
    .order('start_time', { ascending: true });

  return formatApiResponse(Promise.resolve(query));
}

export async function getPastActivities() {
  const now = new Date().toISOString();
  const query = supabase
    .from("events")
    .select("*")
    .lt('start_time', now)
    .order('start_time', { ascending: false });

  return formatApiResponse(Promise.resolve(query));
}
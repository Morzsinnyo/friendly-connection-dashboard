import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MapPin, Users, Video, Phone, CalendarPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  meeting_link: string | null;
  guests: string[] | null;
}

const PlannedActivities = () => {
  const navigate = useNavigate();
  
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
        throw error;
      }

      console.log("Events fetched:", data);
      return data as Event[];
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events?.reduce((groups: Record<string, Event[]>, event) => {
    const date = format(new Date(event.start_time), "MMM. dd. EEEE");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Planned Activities</h1>
        <Button
          onClick={() => navigate("/activities/create")}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          Create Activity
        </Button>
      </div>
      
      <div className="space-y-8">
        {groupedEvents && Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <div key={date} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-600">{date}</h2>
            <div className="space-y-4">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="text-gray-500">
                        {format(new Date(event.start_time), "H:mm")}
                      </div>
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      
                      {event.guests && event.guests.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{event.guests.join(", ")}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.meeting_link && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Video className="h-4 w-4" />
                          <a 
                            href={event.meeting_link}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Video call link
                          </a>
                        </div>
                      )}
                      
                      {!event.meeting_link && !event.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>Phone call</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlannedActivities;
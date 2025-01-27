import { ContactsList } from "@/components/contacts/ContactsList";
import { EventList } from "@/components/calendar/EventList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('calendar_id')
        .eq('id', user.id)
        .single();

      if (!profile?.calendar_id) return [];

      const { data, error } = await supabase.functions.invoke('google-calendar', {
        body: { action: 'listEvents', calendarId: profile.calendar_id }
      });

      if (error) throw error;
      return data.items || [];
    }
  });

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('calendar_id')
        .eq('id', user.id)
        .single();

      if (!profile?.calendar_id) return;

      await supabase.functions.invoke('google-calendar', {
        body: { 
          action: 'deleteEvent', 
          eventData: { id: eventId }, 
          calendarId: profile.calendar_id 
        }
      });

      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        {isLoadingEvents ? (
          <div>Loading events...</div>
        ) : (
          <EventList 
            events={events} 
            onDeleteEvent={handleDeleteEvent}
            showReminderControl={false}
          />
        )}
      </div>
      <ContactsList />
    </div>
  );
};

export default Index;
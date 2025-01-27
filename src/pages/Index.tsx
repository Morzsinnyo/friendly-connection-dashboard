import { ContactsList } from "@/components/contacts/ContactsList";
import { CalendarView } from "@/modules/calendar/components/CalendarView";

const Index = () => {
  return (
    <div className="p-4 space-y-8">
      <CalendarView />
      <ContactsList />
    </div>
  );
};

export default Index;
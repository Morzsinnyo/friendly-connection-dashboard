import { ContactList } from "@/modules/contacts/components/ContactList";
import { CalendarView } from "@/modules/calendar/components/CalendarView";

const Index = () => {
  return (
    <div className="p-4 space-y-8">
      <CalendarView />
      <ContactList />
    </div>
  );
};

export default Index;
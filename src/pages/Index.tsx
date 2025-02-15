
import { ContactsList } from "@/components/contacts/ContactsList";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  
  return (
    <div>
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => navigate("/dashboard/settings")}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Tutorial
      </Button>
      <ContactsList />
    </div>
  );
}

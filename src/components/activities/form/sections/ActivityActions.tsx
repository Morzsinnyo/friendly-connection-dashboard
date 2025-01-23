import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ActivityActionsProps {
  isEditMode: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ActivityActions({ isEditMode, onSubmit }: ActivityActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end space-x-4">
      <Button 
        type="button" 
        variant="outline"
        onClick={() => navigate("/activities")}
      >
        Cancel
      </Button>
      <Button type="submit">
        {isEditMode ? 'Update Activity' : 'Create Activity'}
      </Button>
    </div>
  );
}
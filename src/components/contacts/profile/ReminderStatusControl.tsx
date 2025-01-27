import { useState } from "react";
import { Check, Clock, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ReminderStatus } from "./ReminderStatus";
import { useContactStatus } from "@/hooks/contacts/useContactStatus";
import { toast } from "sonner";

interface ReminderStatusControlProps {
  contactId: string;
  currentStatus: 'pending' | 'completed' | 'skipped';
  disabled?: boolean;
  onStatusChange?: () => void;
}

export function ReminderStatusControl({
  contactId,
  currentStatus,
  disabled = false,
  onStatusChange,
}: ReminderStatusControlProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateReminderStatus } = useContactStatus(contactId);

  const handleStatusChange = async (newStatus: 'pending' | 'completed' | 'skipped') => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      await updateReminderStatus(newStatus);
      toast.success(`Reminder marked as ${newStatus}`);
      onStatusChange?.(); // Call the callback if provided
    } catch (error) {
      console.error('Error updating reminder status:', error);
      toast.error('Failed to update reminder status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[140px]"
          disabled={disabled || isUpdating}
        >
          <ReminderStatus status={currentStatus} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem
          onClick={() => handleStatusChange('pending')}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          <span>Mark as Pending</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('completed')}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          <span>Mark as Completed</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusChange('skipped')}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          <span>Mark as Skipped</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
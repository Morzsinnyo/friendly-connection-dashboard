import { useState } from "react";
import { useReminderState } from "../../hooks/useReminderState";
import { ReminderStatus } from "../ReminderStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ReminderBadgeProps {
  status: 'pending' | 'completed' | 'skipped';
  contactId: string;
  onStatusChange: () => void;
  eventSummary?: string;
}

export function ReminderBadge({ 
  status, 
  contactId, 
  onStatusChange,
  eventSummary 
}: ReminderBadgeProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateStatus } = useReminderState(contactId);

  const handleStatusChange = async (newStatus: 'pending' | 'completed' | 'skipped') => {
    if (newStatus === status || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateStatus(newStatus);
      onStatusChange();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0" disabled={isUpdating}>
          <ReminderStatus 
            status={status} 
            onSkip={() => handleStatusChange('skipped')}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
          Mark as Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
          Mark as Completed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('skipped')}>
          Mark as Skipped
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
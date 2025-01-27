import { useState } from "react";
import { Check, Clock, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContactStatus } from "@/hooks/contacts/useContactStatus";
import { cn } from "@/lib/utils";

interface ReminderStatusProps {
  contactId: string;
  currentStatus: 'pending' | 'completed' | 'skipped';
  disabled?: boolean;
}

export function ReminderStatus({
  contactId,
  currentStatus,
  disabled = false,
}: ReminderStatusProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateReminderStatus } = useContactStatus(contactId);

  const handleStatusChange = async (newStatus: 'pending' | 'completed' | 'skipped') => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      await updateReminderStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      variant: "outline" as const,
      label: "Pending",
    },
    completed: {
      icon: Check,
      variant: "secondary" as const, // Changed from 'success' to 'secondary'
      label: "Completed",
    },
    skipped: {
      icon: X,
      variant: "destructive" as const,
      label: "Skipped",
    },
  };

  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[140px]"
          disabled={disabled || isUpdating}
        >
          <Badge
            variant={config.variant}
            className={cn("flex items-center gap-1 w-full justify-center")}
          >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </Badge>
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
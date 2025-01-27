import { ReminderStatus } from "./ReminderStatus";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReminderStatusBadgeProps {
  status: 'pending' | 'completed' | 'skipped';
  contactId: string;
  className?: string;
}

export function ReminderStatusBadge({ status, contactId, className }: ReminderStatusBadgeProps) {
  return (
    <div className={className}>
      <ReminderStatus
        contactId={contactId}
        currentStatus={status}
      />
    </div>
  );
}
import { ReminderStatus } from "./ReminderStatus";

interface ReminderStatusBadgeProps {
  status: 'pending' | 'completed' | 'skipped';
  contactId: string;
  className?: string;
  onStatusChange?: () => void;
}

export function ReminderStatusBadge({ status, contactId, className, onStatusChange }: ReminderStatusBadgeProps) {
  return (
    <div className={className}>
      <ReminderStatus
        contactId={contactId}
        currentStatus={status}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
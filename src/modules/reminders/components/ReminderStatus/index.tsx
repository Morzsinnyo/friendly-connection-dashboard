import { Check, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ReminderStatus = 'pending' | 'completed' | 'skipped';

interface ReminderStatusProps {
  status: ReminderStatus;
  className?: string;
  onSkip?: () => Promise<void>;
}

const statusConfig = {
  pending: {
    icon: Clock,
    variant: "outline",
    label: "Pending",
  },
  completed: {
    icon: Check,
    variant: "success",
    label: "Completed",
  },
  skipped: {
    icon: X,
    variant: "destructive",
    label: "Skipped",
  },
} as const;

export function ReminderStatus({ status, className, onSkip }: ReminderStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant as any}
      className={cn("flex items-center gap-1", className)}
      onClick={onSkip}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}
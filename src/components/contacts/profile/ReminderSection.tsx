import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingOverlay } from "./LoadingOverlay";
import { ReminderStatusControl } from "./ReminderStatusControl";
import { format } from "date-fns";

type ReminderFrequency = 'Every week' | 'Every 2 weeks' | 'Monthly' | 'Every 2 months' | 'Every 3 months' | null;

interface ReminderSectionProps {
  selectedReminder: ReminderFrequency;
  onReminderSelect: (frequency: ReminderFrequency) => void;
  contactName: string;
  isLoading?: boolean;
  nextReminder?: Date | null;
  reminderStatus?: 'pending' | 'completed' | 'skipped';
  contactId: string;
}

const REMINDER_OPTIONS: ReminderFrequency[] = [
  'Every week',
  'Every 2 weeks',
  'Monthly',
  'Every 2 months',
  'Every 3 months'
];

export function ReminderSection({ 
  selectedReminder, 
  onReminderSelect, 
  contactName,
  isLoading = false,
  nextReminder,
  reminderStatus = 'pending',
  contactId,
}: ReminderSectionProps) {
  return (
    <div className="relative">
      {isLoading && <LoadingOverlay message="Updating reminder..." />}
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                {selectedReminder ? 'Change Reminder' : 'Set Reminder'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {REMINDER_OPTIONS.map((frequency) => (
                <DropdownMenuItem
                  key={frequency}
                  onClick={() => onReminderSelect(frequency)}
                  className="flex justify-between items-center"
                >
                  <span>{frequency}</span>
                  {selectedReminder === frequency && (
                    <Bell className="h-4 w-4 ml-2" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {selectedReminder && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onReminderSelect(null)}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        {selectedReminder && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Checking in {selectedReminder.toLowerCase()}
                {nextReminder && (
                  <span className="ml-2">
                    (Next: {format(nextReminder, "MMM d")})
                  </span>
                )}
              </span>
            </div>
            
            <ReminderStatusControl
              contactId={contactId}
              currentStatus={reminderStatus}
              disabled={!nextReminder}
            />
          </>
        )}
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { LoadingOverlay } from "./LoadingOverlay";
import { ReminderStatusControl } from "./ReminderStatusControl";
import { format } from "date-fns";

type ReminderFrequency = 'Every week' | 'Every 2 weeks' | 'Monthly' | 'Every 2 months' | 'Every 3 months' | null;

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface ReminderSectionProps {
  selectedReminder: ReminderFrequency;
  onReminderSelect: (frequency: ReminderFrequency, preferredDay?: DayOfWeek) => void;
  contactName: string;
  isLoading?: boolean;
  nextReminder?: Date | null;
  reminderStatus?: 'pending' | 'completed' | 'skipped';
  contactId: string;
  preferredDay?: DayOfWeek;
}

const REMINDER_OPTIONS: ReminderFrequency[] = [
  'Every week',
  'Every 2 weeks',
  'Monthly',
  'Every 2 months',
  'Every 3 months'
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const getDayLabel = (day?: DayOfWeek) => {
  if (day === undefined) return '';
  return DAYS_OF_WEEK.find(d => d.value === day)?.label || '';
};

export function ReminderSection({ 
  selectedReminder, 
  onReminderSelect, 
  contactName,
  isLoading = false,
  nextReminder,
  reminderStatus = 'pending',
  contactId,
  preferredDay,
}: ReminderSectionProps) {
  const handleFrequencySelect = (frequency: ReminderFrequency) => {
    if (!frequency) {
      onReminderSelect(null);
      return;
    }
    
    // If selecting a new frequency, keep the existing preferred day if any
    onReminderSelect(frequency, preferredDay);
  };

  const handleDaySelect = (day: DayOfWeek) => {
    if (selectedReminder) {
      onReminderSelect(selectedReminder, day);
    }
  };

  const formatReminderText = () => {
    if (!selectedReminder) return '';
    
    const dayText = getDayLabel(preferredDay);
    const frequencyText = selectedReminder.toLowerCase();
    
    if (!dayText) return `Checking in ${frequencyText}`;
    
    if (selectedReminder === 'Every week') {
      return `Checking in every ${dayText}`;
    } else if (selectedReminder === 'Every 2 weeks') {
      return `Checking in every other ${dayText}`;
    } else {
      return `Checking in on the first ${dayText} of each month`;
    }
  };

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
              <DropdownMenuLabel>Frequency</DropdownMenuLabel>
              {REMINDER_OPTIONS.map((frequency) => (
                <DropdownMenuItem
                  key={frequency}
                  onClick={() => handleFrequencySelect(frequency)}
                  className="flex justify-between items-center"
                >
                  <span>{frequency}</span>
                  {selectedReminder === frequency && (
                    <Bell className="h-4 w-4 ml-2" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Preferred Day</DropdownMenuLabel>
              {DAYS_OF_WEEK.map(({ value, label }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => handleDaySelect(value as DayOfWeek)}
                  className="flex justify-between items-center"
                  disabled={!selectedReminder}
                >
                  <span>{label}</span>
                  {preferredDay === value && (
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
                {formatReminderText()}
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

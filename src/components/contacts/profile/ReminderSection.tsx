
import { useState } from "react";
import { Bell, Calendar, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ReminderStatusControl } from "./ReminderStatusControl";
import { LoadingOverlay } from "./LoadingOverlay";
import { format } from "date-fns";
import { DayOfWeek, DAYS_OF_WEEK, ReminderFrequency, REMINDER_FREQUENCIES } from "@/api/types/reminders";

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
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (frequency: ReminderFrequency, day?: DayOfWeek) => {
    onReminderSelect(frequency, day);
    setIsOpen(false);
  };

  const getDayLabel = (day?: DayOfWeek) => {
    if (typeof day !== 'number') return '';
    return DAYS_OF_WEEK.find(d => d.value === day)?.label || '';
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
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              {selectedReminder ? 'Change Reminder' : 'Set Reminder'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px]">
            <DropdownMenuLabel>Frequency</DropdownMenuLabel>
            {REMINDER_FREQUENCIES.map((frequency) => (
              <DropdownMenuItem
                key={frequency}
                onClick={() => handleSelect(frequency, preferredDay)}
                className="flex justify-between items-center"
              >
                <span>{frequency}</span>
                {selectedReminder === frequency && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
            ))}

            {selectedReminder && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Preferred Day</DropdownMenuLabel>
                {DAYS_OF_WEEK.map(({ value, label }) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => handleSelect(selectedReminder, value)}
                    className="flex justify-between items-center"
                  >
                    <span>{label}</span>
                    {preferredDay === value && (
                      <Calendar className="h-4 w-4 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {selectedReminder && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => handleSelect(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Reminder
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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

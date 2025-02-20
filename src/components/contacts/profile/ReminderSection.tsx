
import { useState, useCallback } from "react";
import { Bell, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
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
  const [processingDay, setProcessingDay] = useState<number | null>(null);

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

  const handleDaySelect = useCallback((frequency: ReminderFrequency, day: DayOfWeek) => {
    if (selectedReminder === frequency && preferredDay === day) {
      return;
    }

    if (processingDay !== null) {
      return;
    }

    setProcessingDay(day);
    onReminderSelect(frequency, day);
    
    setTimeout(() => {
      setProcessingDay(null);
    }, 1000);
  }, [selectedReminder, preferredDay, processingDay, onReminderSelect]);

  const handleRemoveReminder = useCallback(() => {
    setIsOpen(false);
    onReminderSelect(null);
  }, [onReminderSelect]);

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
          <DropdownMenuPortal>
            <DropdownMenuContent
              align="start"
              className="w-[280px] md:w-[320px] bg-popover overflow-y-auto max-h-[400px] relative md:absolute"
            >
              <DropdownMenuLabel className="font-semibold">Set Check-in Schedule</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {REMINDER_FREQUENCIES.map((frequency) => (
                <div key={frequency} className="px-2 py-1.5 hover:bg-accent rounded-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{frequency}</span>
                    {selectedReminder === frequency && preferredDay !== undefined && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:flex md:gap-1 gap-0.5 md:flex-wrap">
                    {DAYS_OF_WEEK.map(({ value, label }) => (
                      <Button
                        key={`${frequency}-${value}`}
                        variant={selectedReminder === frequency && preferredDay === value ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs md:px-3 px-2"
                        onClick={() => handleDaySelect(frequency, value)}
                        disabled={isLoading || processingDay === value}
                      >
                        {label.slice(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              {selectedReminder && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={handleRemoveReminder}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Reminder
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenuPortal>
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


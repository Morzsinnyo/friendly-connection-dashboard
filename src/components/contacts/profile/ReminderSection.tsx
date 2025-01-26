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
import { useState } from "react";
import { CustomRecurrenceDialog } from "./recurrence/CustomRecurrenceDialog";
import { CustomRecurrence } from "@/api/types/contacts";

type ReminderFrequency = 'Every week' | 'Every 2 weeks' | 'Monthly' | 'Custom' | null;

interface ReminderSectionProps {
  selectedReminder: ReminderFrequency;
  onReminderSelect: (frequency: ReminderFrequency, customRecurrence?: CustomRecurrence) => void;
  contactName: string;
  isLoading?: boolean;
  nextReminder?: Date | null;
  reminderStatus?: 'pending' | 'completed' | 'skipped';
  contactId: string;
}

const REMINDER_OPTIONS: ReminderFrequency[] = ['Every week', 'Every 2 weeks', 'Monthly', 'Custom'];

export function ReminderSection({ 
  selectedReminder, 
  onReminderSelect, 
  contactName,
  isLoading = false,
  nextReminder,
  reminderStatus = 'pending',
  contactId,
}: ReminderSectionProps) {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);

  const handleReminderSelect = (frequency: ReminderFrequency) => {
    if (frequency === 'Custom') {
      setIsCustomDialogOpen(true);
    } else {
      onReminderSelect(frequency);
    }
  };

  const handleCustomRecurrence = (recurrence: CustomRecurrence) => {
    onReminderSelect('Custom', recurrence);
    setIsCustomDialogOpen(false);
  };

  return (
    <div className="relative space-y-4">
      {isLoading && <LoadingOverlay message="Updating reminder..." />}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
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
                  onClick={() => handleReminderSelect(frequency)}
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
              Remove Reminder
            </Button>
          )}
        </div>

        {selectedReminder && (
          <ReminderStatusControl
            contactId={contactId}
            currentStatus={reminderStatus}
            disabled={!nextReminder}
          />
        )}
      </div>
      
      {selectedReminder && (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Reminder set to check in with {contactName} {selectedReminder.toLowerCase()}
          </p>
          {nextReminder && (
            <p>
              Next reminder: {format(nextReminder, "PPP 'at' p")}
            </p>
          )}
        </div>
      )}

      <CustomRecurrenceDialog
        isOpen={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        onSave={handleCustomRecurrence}
      />
    </div>
  );
}
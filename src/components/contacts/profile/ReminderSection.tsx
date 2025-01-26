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
import { useState, useEffect } from "react";
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
  customRecurrence?: CustomRecurrence | null;
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
  customRecurrence: initialCustomRecurrence,
}: ReminderSectionProps) {
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset processing state when loading state changes
  useEffect(() => {
    if (!isLoading) {
      setIsProcessing(false);
    }
  }, [isLoading]);

  // Reset processing state when dialog closes
  useEffect(() => {
    if (!isCustomDialogOpen) {
      setIsProcessing(false);
    }
  }, [isCustomDialogOpen]);

  useEffect(() => {
    if (initialCustomRecurrence && selectedReminder !== 'Custom') {
      onReminderSelect('Custom', initialCustomRecurrence);
    }
  }, [initialCustomRecurrence]);

  const handleReminderSelect = async (frequency: ReminderFrequency) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      if (frequency === 'Custom') {
        setIsCustomDialogOpen(true);
      } else {
        await onReminderSelect(frequency);
      }
    } catch (error) {
      console.error('Error selecting reminder:', error);
    } finally {
      if (frequency !== 'Custom') {
        setIsProcessing(false);
      }
    }
  };

  const handleCustomRecurrence = async (recurrence: CustomRecurrence) => {
    try {
      setIsProcessing(true);
      await onReminderSelect('Custom', recurrence);
    } catch (error) {
      console.error('Error setting custom recurrence:', error);
    } finally {
      setIsCustomDialogOpen(false);
      setIsProcessing(false);
    }
  };

  const isButtonDisabled = isLoading || isProcessing;

  return (
    <div className="relative space-y-4">
      {(isLoading || isProcessing) && <LoadingOverlay message="Updating reminder..." />}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isButtonDisabled}
              >
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
                  disabled={isButtonDisabled}
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
              onClick={() => handleReminderSelect(null)}
              disabled={isButtonDisabled}
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
            disabled={!nextReminder || isButtonDisabled}
          />
        )}
      </div>
      
      {selectedReminder && (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Reminder set to check in with {contactName} {
              selectedReminder === 'Custom' && initialCustomRecurrence
                ? `every ${initialCustomRecurrence.interval} ${initialCustomRecurrence.unit}(s)`
                : selectedReminder.toLowerCase()
            }
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
        onClose={() => {
          setIsCustomDialogOpen(false);
          setIsProcessing(false);
        }}
        onSave={handleCustomRecurrence}
        initialValues={initialCustomRecurrence}
      />
    </div>
  );
}
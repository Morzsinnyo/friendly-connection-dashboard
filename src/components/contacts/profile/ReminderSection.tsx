import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingOverlay } from "./LoadingOverlay";

type ReminderFrequency = 'Every week' | 'Every 2 weeks' | 'Monthly' | null;

interface ReminderSectionProps {
  selectedReminder: ReminderFrequency;
  onReminderSelect: (frequency: ReminderFrequency) => void;
  contactName: string;
  isLoading?: boolean;
}

const REMINDER_OPTIONS: ReminderFrequency[] = ['Every week', 'Every 2 weeks', 'Monthly'];

export function ReminderSection({ 
  selectedReminder, 
  onReminderSelect, 
  contactName,
  isLoading = false 
}: ReminderSectionProps) {
  return (
    <div className="relative">
      {isLoading && <LoadingOverlay message="Updating reminder..." />}
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
                onClick={() => onReminderSelect(frequency)}
                className="flex justify-between items-center"
              >
                <span>{frequency}</span>
                {selectedReminder === frequency && (
                  <Check className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="sm"
          className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${!selectedReminder ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onReminderSelect(null)}
          disabled={!selectedReminder}
        >
          <X className="h-4 w-4 mr-2" />
          Remove Reminder
        </Button>
      </div>
      
      {selectedReminder && (
        <p className="text-sm text-muted-foreground mt-2">
          Reminder set to check in with {contactName} {selectedReminder.toLowerCase()}
        </p>
      )}
    </div>
  );
}
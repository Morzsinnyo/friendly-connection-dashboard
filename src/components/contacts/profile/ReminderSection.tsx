import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingOverlay } from "./LoadingOverlay";

interface ReminderSectionProps {
  selectedReminder: string | null;
  onReminderSelect: (frequency: string | null) => void;
  contactName: string;
  isLoading?: boolean;
}

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
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onReminderSelect('Every week')} className="flex justify-between">
              <span>Every week</span>
              {selectedReminder === 'Every week' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReminderSelect('Every 2 weeks')} className="flex justify-between">
              <span>Every 2 weeks</span>
              {selectedReminder === 'Every 2 weeks' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReminderSelect('Monthly')} className="flex justify-between">
              <span>Monthly</span>
              {selectedReminder === 'Monthly' && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
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
        <p className="text-sm text-muted-foreground mt-2">
          Reminder set to check in with {contactName} {selectedReminder.toLowerCase()}
        </p>
      )}
    </div>
  );
}
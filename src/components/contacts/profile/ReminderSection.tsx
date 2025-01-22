import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReminderSectionProps {
  selectedReminder: string | null;
  onReminderSelect: (frequency: string) => void;
  contactName: string;
}

export function ReminderSection({ selectedReminder, onReminderSelect, contactName }: ReminderSectionProps) {
  return (
    <div className="flex space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Reminder
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onReminderSelect('Every week')}>
            Every week {selectedReminder === 'Every week' && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReminderSelect('Every 2 weeks')}>
            Every 2 weeks {selectedReminder === 'Every 2 weeks' && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReminderSelect('Monthly')}>
            Monthly {selectedReminder === 'Monthly' && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
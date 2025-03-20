import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Bell, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/contacts/useUserProfile";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { useContactMutations } from "@/hooks/contacts/useContactMutations";
import { 
  DayOfWeek, 
  DAYS_OF_WEEK, 
  ReminderFrequency, 
  REMINDER_FREQUENCIES 
} from "@/api/types/reminders";

function ContactReminderCard({ contact, calendarId }: { 
  contact: any; 
  calendarId?: string;
}) {
  const [reminderOpen, setReminderOpen] = useState(false);
  const [frequency, setFrequency] = useState<ReminderFrequency>(contact.reminder_frequency as ReminderFrequency);
  const [preferredDay, setPreferredDay] = useState<DayOfWeek | undefined>(
    contact.preferred_reminder_day as DayOfWeek | undefined
  );
  const { updateReminderMutation } = useContactMutations(contact.id);
  
  const setReminder = (newFrequency: ReminderFrequency, newPreferredDay?: DayOfWeek) => {
    if (!calendarId && newFrequency) {
      toast.error("Please set up your calendar ID first");
      return;
    }
    
    updateReminderMutation.mutate({
      reminderFrequency: newFrequency,
      calendarId: calendarId || '',
      contactName: contact.full_name,
      preferredDay: newPreferredDay
    });
    
    setFrequency(newFrequency);
    setPreferredDay(newPreferredDay);
    setReminderOpen(false);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            {contact.avatar_url ? (
              <AvatarImage src={contact.avatar_url} alt={contact.full_name} />
            ) : (
              <AvatarFallback>{getInitials(contact.full_name)}</AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <p className="font-medium truncate">{contact.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {frequency ? `${frequency}${preferredDay !== undefined ? 
                ` (${DAYS_OF_WEEK.find(d => d.value === preferredDay)?.label})` : ''}` : 
                'No reminder set'}
            </p>
          </div>
          
          <DropdownMenu open={reminderOpen} onOpenChange={setReminderOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                {frequency ? 'Change' : 'Set Reminder'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px]">
              <DropdownMenuLabel>Set Check-in Schedule</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {REMINDER_FREQUENCIES.map((freq) => (
                <div key={freq} className="px-2 py-1.5 hover:bg-accent rounded-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{freq}</span>
                    {frequency === freq && preferredDay !== undefined && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:flex md:gap-1 gap-0.5 md:flex-wrap">
                    {DAYS_OF_WEEK.map(({ value, label }) => (
                      <Button
                        key={`${freq}-${value}`}
                        variant={frequency === freq && preferredDay === value ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs md:px-3 px-2"
                        onClick={() => setReminder(freq, value)}
                        disabled={updateReminderMutation.isPending}
                      >
                        {label.slice(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              {frequency && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => setReminder(null, undefined)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Reminder
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

interface OnboardingRemindersProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingReminders({ onNext, onBack }: OnboardingRemindersProps) {
  const { data: profile } = useUserProfile();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('contacts')
          .select('id, full_name, avatar_url, reminder_frequency, preferred_reminder_day')
          .eq('user_id', user.id)
          .order('full_name', { ascending: true });
        
        if (error) throw error;
        setContacts(data || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast.error("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Clock className="h-12 w-12 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold">Set reminders for your contacts</h2>
        <p className="text-muted-foreground">
          Choose how often you'd like to be reminded to check in with your contacts.
        </p>
      </div>
      
      <div className="space-y-4 mt-4">
        <h3 className="text-lg font-medium">Contact reminders</h3>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <Card key={n}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                    <Skeleton className="h-8 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              No contacts found. Add contacts in the previous step to set specific reminders.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {contacts.map((contact) => (
              <ContactReminderCard 
                key={contact.id} 
                contact={contact} 
                calendarId={profile?.calendar_id} 
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}

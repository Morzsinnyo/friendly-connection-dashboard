import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Plus } from "lucide-react";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    console.log("Selected date:", date);
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        
        <div className="border rounded-lg p-4 bg-white">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            className="rounded-md border"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Add Event - {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" placeholder="Add title" />
              </div>

              <div className="grid gap-2">
                <Label>Time</Label>
                <div className="flex gap-2">
                  <Input type="time" className="w-full" />
                  <span className="flex items-center">to</span>
                  <Input type="time" className="w-full" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location or Video Call</Label>
                <Input 
                  id="location" 
                  placeholder="Add location or video call link" 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Add description" 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="invitees">Invitees</Label>
                <Input 
                  id="invitees" 
                  placeholder="Add people" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                console.log("Save event");
                setIsDialogOpen(false);
              }}>
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
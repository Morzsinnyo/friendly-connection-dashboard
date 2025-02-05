import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useContactMutations } from "@/hooks/contacts/useContactMutations";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { getNoteContent } from "@/api/types/contacts";
import { Note, createNote, groupNotesByDate, formatNoteTimestamp, notesToJson } from "@/api/types/notes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NotesSectionProps {
  contactId: string;
  initialNotes?: any;
}

export function NotesSection({ contactId, initialNotes }: NotesSectionProps) {
  const [currentNote, setCurrentNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const { updateNotesMutation } = useContactMutations(contactId);

  useEffect(() => {
    // Initialize notes from the contact data
    const existingNotes = getNoteContent(initialNotes);
    setNotes(existingNotes);
  }, [initialNotes]);

  const debouncedUpdate = debounce((updatedNotes: Note[]) => {
    console.log('Updating notes for contact:', contactId);
    const jsonNotes = notesToJson(updatedNotes);
    updateNotesMutation.mutate(jsonNotes, {
      onError: () => {
        toast.error('Failed to save notes');
      }
    });
  }, 1000);

  const handleAddNote = () => {
    if (!currentNote.trim()) return;

    const newNote = createNote(currentNote.trim());
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setCurrentNote("");
    debouncedUpdate(updatedNotes);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const groupedNotes = groupNotesByDate(notes);

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full space-y-4">
        <div className="flex flex-col space-y-2">
          <Textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new note... (Press Enter to save)"
            className="resize-none"
            rows={3}
          />
        </div>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {Object.entries(groupedNotes).map(([date, dateNotes]) => (
              <div key={date} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm py-2">
                  {date}
                </h3>
                <div className="space-y-2">
                  {dateNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-1"
                    >
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNoteTimestamp(note.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
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
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotesSectionProps {
  contactId: string;
  initialNotes?: any;
}

export function NotesSection({ contactId, initialNotes }: NotesSectionProps) {
  const [currentNote, setCurrentNote] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const { updateNotesMutation } = useContactMutations(contactId);

  useEffect(() => {
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

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    debouncedUpdate(updatedNotes);
    toast.success('Note deleted successfully');
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
      <CardHeader className="flex-none">
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 space-y-4 overflow-hidden">
        <div className="flex-none">
          <Textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new note... (Press Enter to save)"
            className="resize-none"
            rows={3}
          />
        </div>
        
        <ScrollArea className="flex-1 h-[calc(100%-120px)] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedNotes).map(([date, dateNotes]) => (
              <div key={date} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                  {date}
                </h3>
                <div className="space-y-2">
                  {dateNotes.map((note) => (
                    <div
                      key={note.id}
                      className="group p-3 rounded-lg bg-muted/50 space-y-1 relative"
                    >
                      <p className="text-sm whitespace-pre-wrap pr-8">{note.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNoteTimestamp(note.timestamp)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
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
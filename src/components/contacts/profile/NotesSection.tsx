import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useContactMutations } from "@/hooks/contacts/useContactMutations";
import { toast } from "sonner";
import debounce from "lodash/debounce";

interface NotesSectionProps {
  contactId: string;
  initialNotes?: string | null;
}

export function NotesSection({ contactId, initialNotes }: NotesSectionProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const { updateNotesMutation } = useContactMutations(contactId);

  const debouncedUpdate = debounce((newNotes: string) => {
    console.log('Updating notes for contact:', contactId);
    updateNotesMutation.mutate(newNotes, {
      onError: () => {
        toast.error('Failed to save notes');
      }
    });
  }, 1000);

  useEffect(() => {
    return () => {
      debouncedUpdate.flush();
    };
  }, [debouncedUpdate]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    debouncedUpdate(newNotes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add notes about this contact..."
          className="min-h-[200px] resize-y"
        />
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContactMutations } from "@/hooks/contacts/useContactMutations";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { RichTextEditor } from "./editor/RichTextEditor";
import { EditorContent } from "@/api/types/editor";

interface NotesSectionProps {
  contactId: string;
  initialNotes?: string | null;
}

export function NotesSection({ contactId, initialNotes }: NotesSectionProps) {
  const [notes, setNotes] = useState<EditorContent>(initialNotes || '');
  const { updateNotesMutation } = useContactMutations(contactId);

  const debouncedUpdate = debounce((newNotes: EditorContent) => {
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

  const handleNotesChange = (newNotes: EditorContent) => {
    setNotes(newNotes);
    debouncedUpdate(newNotes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <RichTextEditor
          initialContent={notes}
          onChange={handleNotesChange}
          className="min-h-[200px]"
        />
      </CardContent>
    </Card>
  );
}
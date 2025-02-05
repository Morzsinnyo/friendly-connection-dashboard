import { Json } from "@/integrations/supabase/types";

export interface Note {
  id: string;
  content: string;
  timestamp: string;
  type?: string;
}

export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
}

// Convert string or Json[] to Note[]
export const parseNotes = (notes: Json[] | string | null): Note[] => {
  console.log('Parsing notes:', notes);
  if (!notes) return [];

  if (typeof notes === 'string') {
    try {
      const parsedNotes = JSON.parse(notes);
      if (Array.isArray(parsedNotes)) {
        return parsedNotes.map(note => {
          if (typeof note === 'string') {
            return createNote(note);
          }
          return note as Note;
        });
      }
      return [createNote(notes)];
    } catch {
      return [createNote(notes)];
    }
  }

  if (Array.isArray(notes)) {
    return notes.map(note => {
      if (typeof note === 'string') {
        return createNote(note);
      }
      // Ensure the note has the required properties before casting
      if (isValidNote(note)) {
        return note as Note;
      }
      return createNote(String(note));
    });
  }

  return [];
};

// Utility function to sort notes by timestamp
export const sortNotesByDate = (notes: Note[]): Note[] => {
  return [...notes].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// Utility function to group notes by date
export const groupNotesByDate = (notes: Note[]): Record<string, Note[]> => {
  const grouped = notes.reduce((acc: Record<string, Note[]>, note) => {
    const date = new Date(note.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(note);
    return acc;
  }, {});

  // Sort notes within each group
  Object.keys(grouped).forEach(date => {
    grouped[date] = sortNotesByDate(grouped[date]);
  });

  return grouped;
};

// Utility function to format timestamp
export const formatNoteTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Utility function to validate note format
export const isValidNote = (note: any): note is Note => {
  return (
    typeof note === 'object' &&
    typeof note.id === 'string' &&
    typeof note.content === 'string' &&
    typeof note.timestamp === 'string' &&
    (!note.type || typeof note.type === 'string')
  );
};

// Utility function to create a new note
export const createNote = (content: string): Note => ({
  id: crypto.randomUUID(),
  content,
  timestamp: new Date().toISOString(),
  type: 'note'
});

// Utility function to convert notes to database format
export const notesToJson = (notes: Note[] | string | null): Json[] => {
  console.log('Converting notes to JSON:', notes);
  if (!notes) return [];
  
  if (typeof notes === 'string') {
    const note = createNote(notes);
    return [{ ...note }];
  }
  
  return notes.map(note => ({ ...note }));
};
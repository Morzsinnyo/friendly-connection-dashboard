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
export const parseNotes = (notes: any): Note[] => {
  console.log('Parsing notes:', notes);
  if (!notes) return [];
  
  // If it's already a Note array, return it
  if (Array.isArray(notes) && notes.every(isValidNote)) {
    console.log('Notes are already in correct format');
    return notes;
  }

  // If it's a string, create a single note
  if (typeof notes === 'string') {
    console.log('Converting string to note');
    return [createNote(notes)];
  }

  // If it's an array of strings or mixed content
  if (Array.isArray(notes)) {
    console.log('Converting array to notes');
    return notes.map(note => {
      if (typeof note === 'string') return createNote(note);
      if (isValidNote(note)) return note;
      return createNote(String(note));
    });
  }

  console.log('Unable to parse notes, returning empty array');
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
export const notesToJson = (notes: Note[] | string | null): any[] => {
  console.log('Converting notes to JSON:', notes);
  if (!notes) return [];
  if (typeof notes === 'string') return [createNote(notes)];
  return notes;
};
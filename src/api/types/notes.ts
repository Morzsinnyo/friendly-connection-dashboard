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
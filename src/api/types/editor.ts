export type EditorContent = string | null;

export interface DocumentNode {
  type: string;
  content?: DocumentNode[];
  text?: string;
}

// Type guard to check if value is EditorContent
export function isEditorContent(value: unknown): value is EditorContent {
  return value === null || typeof value === 'string';
}

// Type guard to check if value is DocumentNode
export function isDocumentNode(value: unknown): value is DocumentNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as DocumentNode).type === 'string'
  );
}
export type EditorContent = string | null;

export interface DocumentNode {
  type: string;
  content?: DocumentNode[];
  text?: string;
}
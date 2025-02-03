export type TextNode = {
  type: 'text';
  text: string;
  marks?: Mark[];
};

export type ParagraphNode = {
  type: 'paragraph';
  content: TextNode[];
};

export type Mark = {
  type: 'bold' | 'italic' | 'underline' | 'code';
};

export type DocumentNode = {
  type: 'doc';
  content: ParagraphNode[];
};

export type EditorContent = DocumentNode | string;
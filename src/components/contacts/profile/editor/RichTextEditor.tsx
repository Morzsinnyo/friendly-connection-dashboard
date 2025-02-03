import React, { useCallback, useEffect, useState } from 'react';
import { EditorContent } from '@/api/types/editor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Code } from 'lucide-react';

interface RichTextEditorProps {
  initialContent: EditorContent;
  onChange: (content: EditorContent) => void;
  className?: string;
}

export function RichTextEditor({ initialContent, onChange, className }: RichTextEditorProps) {
  const [content, setContent] = useState<EditorContent>(initialContent);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
    onChange(newContent);
  }, [onChange]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const applyFormat = useCallback((format: string) => {
    document.execCommand(format, false);
  }, []);

  return (
    <Card className={className}>
      <div className="p-2 border-b flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('formatBlock', 'pre')}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>
      <div
        className="p-4 min-h-[200px] focus:outline-none"
        contentEditable
        onInput={handleChange}
        dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : '' }}
      />
    </Card>
  );
}
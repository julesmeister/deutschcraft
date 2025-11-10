'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from './editor/EditorToolbar';

interface RichTextEditorProps {
  label?: string;
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  maxHeight?: string;
  className?: string;
}

export function RichTextEditor({
  label,
  value = '',
  onChange,
  placeholder = 'Start typing...',
  maxHeight = '600px',
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'm-2 focus:outline-none prose prose-sm max-w-full',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      {label && <label className="block font-semibold text-gray-900 mb-2">{label}</label>}
      <div className="rounded-xl ring-1 ring-gray-200 border border-gray-200 bg-gray-100 pt-3">
        <EditorToolbar editor={editor} />
        <div
          className="overflow-auto px-2 pb-2 bg-white rounded-b-xl"
          style={{ maxHeight }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

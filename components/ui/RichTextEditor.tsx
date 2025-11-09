'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';

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
  const [isHeadingDropdownOpen, setIsHeadingDropdownOpen] = useState(false);

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

  const ToolButton = ({
    onClick,
    active = false,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center p-1.5 rounded-lg text-xl transition-colors ${
        active ? 'bg-gray-200 text-blue-600' : 'text-gray-900 hover:text-blue-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className={`mb-6 ${className}`}>
      {label && <label className="block font-semibold text-gray-900 mb-2">{label}</label>}
      <div className="rounded-xl ring-1 ring-gray-200 border border-gray-200 bg-gray-100 pt-3">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-x-1 gap-y-2 px-2 mb-2">
          {/* Bold */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z"></path>
              <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7"></path>
            </svg>
          </ToolButton>

          {/* Italic */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M11 5l6 0"></path>
              <path d="M7 19l6 0"></path>
              <path d="M14 5l-4 14"></path>
            </svg>
          </ToolButton>

          {/* Strikethrough */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M5 12l14 0"></path>
              <path d="M16 6.5a4 2 0 0 0 -4 -1.5h-1a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-1.5a4 2 0 0 1 -4 -1.5"></path>
            </svg>
          </ToolButton>

          {/* Code */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Code"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M7 8l-4 4l4 4"></path>
              <path d="M17 8l4 4l-4 4"></path>
              <path d="M14 4l-4 16"></path>
            </svg>
          </ToolButton>

          {/* Blockquote */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
              <path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5"></path>
            </svg>
          </ToolButton>

          {/* Heading Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsHeadingDropdownOpen(!isHeadingDropdownOpen)}
              className={`flex items-center p-1.5 rounded-lg text-xl transition-colors ${
                editor.isActive('heading')
                  ? 'bg-gray-200 text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
              title="Heading"
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
              >
                <path d="M6 12h12"></path>
                <path d="M6 20V4"></path>
                <path d="M18 20V4"></path>
              </svg>
            </button>

            {isHeadingDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsHeadingDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                          .run();
                        setIsHeadingDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 font-semibold ${
                        editor.isActive('heading', { level })
                          ? 'bg-gray-50 text-blue-600'
                          : 'text-gray-900'
                      }`}
                    >
                      Heading {level}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bullet List */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M9 6l11 0"></path>
              <path d="M9 12l11 0"></path>
              <path d="M9 18l11 0"></path>
              <path d="M5 6l0 .01"></path>
              <path d="M5 12l0 .01"></path>
              <path d="M5 18l0 .01"></path>
            </svg>
          </ToolButton>

          {/* Ordered List */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M11 6h9"></path>
              <path d="M11 12h9"></path>
              <path d="M12 18h8"></path>
              <path d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4"></path>
              <path d="M6 10v-6l-2 2"></path>
            </svg>
          </ToolButton>

          {/* Code Block */}
          <ToolButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M15 12h.01"></path>
              <path d="M12 12h.01"></path>
              <path d="M9 12h.01"></path>
              <path d="M6 19a2 2 0 0 1 -2 -2v-4l-1 -1l1 -1v-4a2 2 0 0 1 2 -2"></path>
              <path d="M18 19a2 2 0 0 0 2 -2v-4l1 -1l-1 -1v-4a2 2 0 0 0 -2 -2"></path>
            </svg>
          </ToolButton>

          {/* Horizontal Rule */}
          <ToolButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
            >
              <path d="M5 12l14 0"></path>
            </svg>
          </ToolButton>
        </div>

        {/* Editor Content */}
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

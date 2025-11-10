'use client';

import { Editor } from '@tiptap/react';
import { useState } from 'react';
import { ToolButton } from './ToolButton';
import { HeadingDropdown } from './HeadingDropdown';
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  BlockquoteIcon,
  BulletListIcon,
  OrderedListIcon,
  CodeBlockIcon,
  HorizontalRuleIcon,
} from './toolbar-icons';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [isHeadingDropdownOpen, setIsHeadingDropdownOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2 px-2 mb-2">
      <ToolButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <BoldIcon />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <ItalicIcon />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <StrikethroughIcon />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Code"
      >
        <CodeIcon />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <BlockquoteIcon />
      </ToolButton>

      <HeadingDropdown
        editor={editor}
        isOpen={isHeadingDropdownOpen}
        onToggle={() => setIsHeadingDropdownOpen(!isHeadingDropdownOpen)}
        onClose={() => setIsHeadingDropdownOpen(false)}
      />

      <ToolButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <BulletListIcon />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Ordered List"
      >
        <OrderedListIcon />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <CodeBlockIcon />
      </ToolButton>

      <ToolButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <HorizontalRuleIcon />
      </ToolButton>
    </div>
  );
}

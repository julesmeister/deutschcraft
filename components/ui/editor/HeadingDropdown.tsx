'use client';

import { Editor } from '@tiptap/react';
import { HeadingIcon } from './toolbar-icons';

interface HeadingDropdownProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function HeadingDropdown({
  editor,
  isOpen,
  onToggle,
  onClose,
}: HeadingDropdownProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center p-1.5 rounded-lg text-xl transition-colors ${
          editor.isActive('heading')
            ? 'bg-gray-200 text-blue-600'
            : 'text-gray-900 hover:text-blue-600'
        }`}
        title="Heading"
      >
        <HeadingIcon />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onClose}
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
                  onClose();
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
  );
}

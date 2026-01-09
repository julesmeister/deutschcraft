/**
 * CategoryList Component
 * Reusable categorized list with headers and dividers
 * Based on grammatik page design
 */

'use client';

import { ReactNode, useState } from 'react';
import { ChevronUp, ChevronDown, Plus, Pencil, Check, X, Eye, EyeOff } from 'lucide-react';

interface CategorySection {
  key: string;
  header: string;
  items: ReactNode[];
  isHidden?: boolean;
}

interface CategoryListProps {
  /** Array of category sections with headers and items */
  categories: CategorySection[];
  /** Optional className for the outer container */
  className?: string;
  /** Optional callback to move section up */
  onMoveSectionUp?: (index: number) => void;
  /** Optional callback to move section down */
  onMoveSectionDown?: (index: number) => void;
  /** Optional callback to add item to section */
  onAddToSection?: (sectionIndex: number, sectionName: string) => void;
  /** Optional callback to rename a section */
  onRenameSection?: (oldName: string, newName: string) => void;
  /** Optional callback to toggle section visibility */
  onToggleHideSection?: (sectionName: string, isHidden: boolean) => void;
}

/**
 * Displays a categorized list with section headers and dividers
 *
 * Example usage:
 * ```tsx
 * <CategoryList
 *   categories={[
 *     {
 *       key: 'verbs',
 *       header: 'Verbs',
 *       items: [<VerbCard1 />, <VerbCard2 />]
 *     },
 *     {
 *       key: 'nouns',
 *       header: 'Nouns',
 *       items: [<NounCard1 />, <NounCard2 />]
 *     }
 *   ]}
 * />
 * ```
 */
export function CategoryList({
  categories,
  className = '',
  onMoveSectionUp,
  onMoveSectionDown,
  onAddToSection,
  onRenameSection,
  onToggleHideSection
}: CategoryListProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');

  const canMoveUp = (index: number) => index > 0;
  const canMoveDown = (index: number) => index < categories.length - 1;
  const showReorderButtons = onMoveSectionUp && onMoveSectionDown;
  const showAddButton = onAddToSection;
  const showRenameButton = onRenameSection;
  const showHideButton = onToggleHideSection;

  const handleStartEditing = (sectionName: string) => {
    setEditingSection(sectionName);
    setEditedName(sectionName);
  };

  const handleSaveRename = (oldName: string) => {
    if (editedName.trim() && editedName !== oldName && onRenameSection) {
      onRenameSection(oldName, editedName.trim());
    }
    setEditingSection(null);
    setEditedName('');
  };

  const handleCancelRename = () => {
    setEditingSection(null);
    setEditedName('');
  };

  return (
    <div className={`bg-white border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="divide-y divide-gray-100">
        {categories.map((category, sectionIndex) => (
          <div key={category.key}>
            {/* Category Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {/* Editable Section Name */}
                {editingSection === category.header ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveRename(category.header);
                        } else if (e.key === 'Escape') {
                          handleCancelRename();
                        }
                      }}
                      className="text-sm font-bold text-gray-700 uppercase tracking-wide bg-white px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRename(category.header)}
                      className="p-1 rounded transition-colors hover:bg-green-100 text-green-600"
                      title="Save section name"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 rounded transition-colors hover:bg-red-100 text-red-600"
                      title="Cancel rename"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {category.header}
                  </h2>
                )}

                {/* Section Action Buttons */}
                {!editingSection && (showReorderButtons || showAddButton || showRenameButton || showHideButton) && (
                  <div className="flex items-center gap-1">
                    {/* Add Button */}
                    {showAddButton && (
                      <button
                        onClick={() => onAddToSection(sectionIndex, category.header)}
                        className="p-1 rounded transition-colors hover:bg-green-100 text-green-600"
                        title="Add exercise to this section"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    {/* Divider after Add */}
                    {showAddButton && (showRenameButton || showHideButton || showReorderButtons) && (
                      <div className="w-px h-4 bg-gray-300 mx-1" />
                    )}

                    {/* Rename Button */}
                    {showRenameButton && (
                      <button
                        onClick={() => handleStartEditing(category.header)}
                        className="p-1 rounded transition-colors hover:bg-blue-100 text-blue-600"
                        title="Rename section"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {/* Divider after Rename */}
                    {showRenameButton && (showHideButton || showReorderButtons) && (
                      <div className="w-px h-4 bg-gray-300 mx-1" />
                    )}

                    {/* Hide/Show Button */}
                    {showHideButton && (
                      <button
                        onClick={() => onToggleHideSection(category.header, !category.isHidden)}
                        className={`p-1 rounded transition-colors ${
                          category.isHidden
                            ? 'hover:bg-green-100 text-green-600'
                            : 'hover:bg-orange-100 text-orange-600'
                        }`}
                        title={category.isHidden ? 'Show section' : 'Hide section'}
                      >
                        {category.isHidden ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Divider after Hide */}
                    {showHideButton && showReorderButtons && (
                      <div className="w-px h-4 bg-gray-300 mx-1" />
                    )}

                    {/* Reorder Buttons */}
                    {showReorderButtons && (
                      <>
                        <button
                          onClick={() => onMoveSectionUp(sectionIndex)}
                          disabled={!canMoveUp(sectionIndex)}
                          className={`p-1 rounded transition-colors ${
                            canMoveUp(sectionIndex)
                              ? 'hover:bg-gray-200 text-gray-700'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title="Move section up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onMoveSectionDown(sectionIndex)}
                          disabled={!canMoveDown(sectionIndex)}
                          className={`p-1 rounded transition-colors ${
                            canMoveDown(sectionIndex)
                              ? 'hover:bg-gray-200 text-gray-700'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title="Move section down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Items List with Dividers */}
            <div className="divide-y divide-gray-100">
              {category.items.map((item, index) => (
                <div key={index}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

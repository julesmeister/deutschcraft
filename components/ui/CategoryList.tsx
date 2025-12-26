/**
 * CategoryList Component
 * Reusable categorized list with headers and dividers
 * Based on grammatik page design
 */

'use client';

import { ReactNode } from 'react';
import { ChevronUp, ChevronDown, Plus } from 'lucide-react';

interface CategorySection {
  key: string;
  header: string;
  items: ReactNode[];
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
  onAddToSection
}: CategoryListProps) {
  const canMoveUp = (index: number) => index > 0;
  const canMoveDown = (index: number) => index < categories.length - 1;
  const showReorderButtons = onMoveSectionUp && onMoveSectionDown;
  const showAddButton = onAddToSection;

  return (
    <div className={`bg-white border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="divide-y divide-gray-100">
        {categories.map((category, sectionIndex) => (
          <div key={category.key}>
            {/* Category Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  {category.header}
                </h2>

                {/* Section Action Buttons */}
                {(showReorderButtons || showAddButton) && (
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

                    {/* Divider */}
                    {showAddButton && showReorderButtons && (
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

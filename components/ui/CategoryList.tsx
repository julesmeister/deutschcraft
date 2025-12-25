/**
 * CategoryList Component
 * Reusable categorized list with headers and dividers
 * Based on grammatik page design
 */

'use client';

import { ReactNode } from 'react';

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
export function CategoryList({ categories, className = '' }: CategoryListProps) {
  return (
    <div className={`bg-white border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="divide-y divide-gray-100">
        {categories.map((category) => (
          <div key={category.key}>
            {/* Category Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {category.header}
              </h2>
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

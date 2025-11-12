/**
 * ExerciseGrid Component
 * Reusable grid wrapper for exercise selectors with empty state
 */

import { ReactNode } from 'react';

interface ExerciseGridProps {
  children: ReactNode;
  isEmpty?: boolean;
  emptyState?: {
    icon: string;
    title: string;
    description: string;
  };
}

export function ExerciseGrid({
  children,
  isEmpty = false,
  emptyState = {
    icon: '📭',
    title: 'No exercises available',
    description: 'Try selecting a different level or check back later'
  }
}: ExerciseGridProps) {
  if (isEmpty) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">{emptyState.icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {emptyState.title}
        </h3>
        <p className="text-gray-600">
          {emptyState.description}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

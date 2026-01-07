/**
 * ExerciseGrid Component
 * Reusable grid wrapper for exercise selectors with empty state
 * Uses column-based layout like testimonial cards
 */

import { ReactNode, Children } from 'react';
import { motion } from 'framer-motion';

interface ExerciseGridProps {
  children: ReactNode;
  isEmpty?: boolean;
  emptyState?: {
    icon: string;
    title: string;
    description: string;
  };
  columnsPerRow?: number;
}

export function ExerciseGrid({
  children,
  isEmpty = false,
  emptyState = {
    icon: '📭',
    title: 'No exercises available',
    description: 'Try selecting a different level or check back later'
  },
  columnsPerRow = 3
}: ExerciseGridProps) {
  if (isEmpty) {
    return (
      <motion.div 
        className="text-center py-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-6xl mb-4">{emptyState.icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {emptyState.title}
        </h3>
        <p className="text-gray-600">
          {emptyState.description}
        </p>
      </motion.div>
    );
  }

  // Convert children to array
  const childrenArray = Children.toArray(children);

  // Split children into columns
  const columns: ReactNode[][] = Array.from({ length: columnsPerRow }, () => []);
  childrenArray.forEach((child, index) => {
    const columnIndex = index % columnsPerRow;
    columns[columnIndex].push(
      <motion.div
        key={`item-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      >
        {child}
      </motion.div>
    );
  });

  return (
    <div
      className="bg-[#f8f8f8] rounded-2xl p-4"
      style={{
        transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)',
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="flex gap-5 overflow-x-auto">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex flex-col gap-5 flex-1"
          >
            {column}
          </div>
        ))}
      </div>
    </div>
  );
}

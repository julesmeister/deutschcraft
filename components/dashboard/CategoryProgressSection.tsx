'use client';

import { useState } from 'react';
import { useCategoryProgress } from '@/lib/hooks/useCategoryProgress';
import { CatLoader } from '../ui/CatLoader';
import { StatGrid, StatItem } from '../ui/StatGrid';
import { Pagination } from '../ui/Pagination';

interface CategoryProgressSectionProps {
  userId: string;
}

export function CategoryProgressSection({ userId }: CategoryProgressSectionProps) {
  const { data: categoryStats = [], isLoading } = useCategoryProgress(userId);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 2 rows of 4 items

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Progress by Category</h3>
        <CatLoader message="Loading category stats..." size="md" />
      </div>
    );
  }

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Progress by Category</h3>
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-sm">No flashcard progress yet</div>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(categoryStats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStats = categoryStats.slice(startIndex, endIndex);

  return (
    <StatGrid
      title="Progress by Category"
      headerContent={
        totalPages > 1 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showPageNumbers={false}
            className="!mt-0 !mb-0"
          />
        ) : null
      }
    >
      {currentStats.map((stat) => (
        <StatItem
          key={stat.category}
          label={stat.category}
          value={`${stat.learned}/${stat.total}`}
          unit={`${stat.percentage}%`}
        />
      ))}
    </StatGrid>
  );
}

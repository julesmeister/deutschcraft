/**
 * Filter Controls Component
 * Search and filter controls for writing submissions
 */

import { Select } from '@/components/ui/Select';
import { WritingExerciseType } from '@/lib/models/writing';

type StatusFilter = 'all' | 'submitted' | 'reviewed';
type ExerciseTypeFilter = WritingExerciseType | 'all';

interface FilterControlsProps {
  statusFilter: StatusFilter;
  exerciseTypeFilter: ExerciseTypeFilter;
  searchQuery: string;
  isStale: boolean;
  filteredCount: number;
  onStatusFilterChange: (value: StatusFilter) => void;
  onExerciseTypeFilterChange: (value: ExerciseTypeFilter) => void;
  onSearchQueryChange: (value: string) => void;
}

export function FilterControls({
  statusFilter,
  exerciseTypeFilter,
  searchQuery,
  isStale,
  filteredCount,
  onStatusFilterChange,
  onExerciseTypeFilterChange,
  onSearchQueryChange,
}: FilterControlsProps) {
  return (
    <div className="m-4 space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
          Student Submissions ({filteredCount})
        </h5>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 gap-3 [&_>_div_>_div]:!bg-gray-50 [&_>_div_>_div]:!border-none [&_>_div_>_div]:!rounded-none [&_>_div_>_div:hover]:!bg-gray-100 [&_>_div_>_div[class*='ring']]:!bg-gray-100 [&_>_div_>_div[class*='ring']]:!ring-0">
        <Select
          value={statusFilter}
          onChange={(value) => onStatusFilterChange(value as StatusFilter)}
          options={[
            { value: 'submitted', label: 'Pending Review' },
            { value: 'reviewed', label: 'Already Graded' },
            { value: 'all', label: 'All Submissions' },
          ]}
        />
        <Select
          value={exerciseTypeFilter}
          onChange={(value) => onExerciseTypeFilterChange(value as ExerciseTypeFilter)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'creative', label: 'Creative Writing' },
            { value: 'translation', label: 'Translation' },
            { value: 'email', label: 'Email' },
            { value: 'letter', label: 'Letter' },
          ]}
        />
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search students or exercises..."
          className="w-full px-4 py-2 pl-10 bg-gray-50 border-none focus:outline-none focus:bg-gray-100 transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isStale && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

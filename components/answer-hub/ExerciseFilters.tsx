/**
 * Exercise Filters Component
 * Search and filter exercises by various criteria
 */

'use client';

import { useState } from 'react';

export interface FilterState {
  search: string;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  status: 'all' | 'new' | 'in_progress' | 'completed';
  hasDiscussion: 'all' | 'yes' | 'no';
}

interface ExerciseFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export function ExerciseFilters({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
}: ExerciseFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleDifficultyChange = (difficulty: FilterState['difficulty']) => {
    onFilterChange({ ...filters, difficulty });
  };

  const handleStatusChange = (status: FilterState['status']) => {
    onFilterChange({ ...filters, status });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      difficulty: 'all',
      status: 'all',
      hasDiscussion: 'all',
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.difficulty !== 'all' ||
    filters.status !== 'all' ||
    filters.hasDiscussion !== 'all';

  return (
    <div className="bg-white border border-gray-200 shadow-sm p-4 space-y-4">
      {/* Search Bar */}
      <div>
        <label htmlFor="search" className="block text-sm font-bold text-gray-700 mb-2">
          Search Exercises
        </label>
        <div className="relative">
          <input
            id="search"
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by number, title, or keyword..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Difficulty Filter */}
        <div>
          <span className="text-xs font-bold text-gray-600 uppercase mr-2">Difficulty:</span>
          <div className="inline-flex gap-1">
            {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => handleDifficultyChange(level)}
                className={`px-3 py-1 text-xs font-bold transition-colors ${
                  filters.difficulty === level
                    ? level === 'easy'
                      ? 'bg-emerald-100 text-emerald-700'
                      : level === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : level === 'hard'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <span className="text-xs font-bold text-gray-600 uppercase mr-2">Status:</span>
          <div className="inline-flex gap-1">
            {(['all', 'new', 'in_progress', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                  filters.status === status
                    ? status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : status === 'in_progress'
                      ? 'bg-amber-100 text-amber-700'
                      : status === 'new'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-600">
          Showing <span className="font-bold text-gray-900">{filteredCount}</span> of{' '}
          <span className="font-bold text-gray-900">{totalCount}</span> exercises
        </div>
      )}
    </div>
  );
}

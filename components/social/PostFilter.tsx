'use client';

import { Batch } from '@/lib/models/batch';

interface PostFilterProps {
  filter: 'all' | 'batch';
  onFilterChange: (filter: 'all' | 'batch') => void;
  batch?: Batch;
}

export default function PostFilter({ filter, onFilterChange, batch }: PostFilterProps) {
  return (
    <div className="bg-white border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
      <div className="px-4 py-3 border-b border-gray-200">
        <h5 className="font-semibold text-gray-900">Filter Posts</h5>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              filter === 'all'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
              </svg>
              <span className="text-sm font-medium">Everyone</span>
            </div>
            {filter === 'all' && (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
              </svg>
            )}
          </button>
          <button
            onClick={() => onFilterChange('batch')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              filter === 'batch'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
              </svg>
              <span className="text-sm font-medium">My Batch</span>
            </div>
            {filter === 'batch' && (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
              </svg>
            )}
          </button>
        </div>
        {batch && filter === 'batch' && (
          <div className="mt-3 pt-3 border-t border-gray-200 animate-fade-in-up">
            <p className="text-xs text-gray-500">
              Showing posts from <span className="font-semibold text-gray-700">{batch.name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

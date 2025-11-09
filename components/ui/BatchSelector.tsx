'use client';

import { useState, useRef, useEffect } from 'react';
import { Batch } from '@/lib/models';

interface BatchSelectorProps {
  batches: Batch[];
  selectedBatch: Batch | null;
  onSelectBatch: (batch: Batch | null) => void;
  onCreateBatch: () => void;
}

export function BatchSelector({
  batches,
  selectedBatch,
  onSelectBatch,
  onCreateBatch,
}: BatchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const displayText = selectedBatch ? selectedBatch.name : 'All Batches';
  const displayLevel = selectedBatch ? selectedBatch.currentLevel : '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-2 px-6 py-2.5 bg-gray-900 text-white font-black text-[14px] rounded-full hover:bg-gray-800 transition-colors min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <span>{displayText}</span>
          {displayLevel && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
              {displayLevel}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-lg z-50 py-2">
          {/* Batch List */}
          <div className="max-h-64 overflow-y-auto">
            {batches.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                <p className="mb-2">No batches yet</p>
                <button
                  onClick={() => {
                    onCreateBatch();
                    setIsOpen(false);
                  }}
                  className="text-piku-cyan hover:underline font-semibold"
                >
                  Create your first batch
                </button>
              </div>
            ) : (
              batches.map((batch) => (
                <button
                  key={batch.batchId}
                  onClick={() => {
                    onSelectBatch(batch);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors ${
                    selectedBatch?.batchId === batch.batchId ? 'bg-gray-800 font-bold text-white' : 'text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{batch.name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <span className="bg-piku-cyan px-2 py-0.5 rounded text-gray-900 font-bold">
                          {batch.currentLevel}
                        </span>
                        <span>{batch.studentCount} students</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {batches.length > 0 && (
            <>
              <div className="border-t border-gray-700 my-2"></div>

              {/* Create New Batch Button */}
              <button
                onClick={() => {
                  onCreateBatch();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-piku-cyan hover:bg-gray-800 transition-colors font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Batch
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

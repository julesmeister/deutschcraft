'use client';

import { useState, useRef, useEffect } from 'react';
import { Batch } from '@/lib/models';

interface BatchSelectorProps {
  batches: Batch[];
  selectedBatch: Batch | null;
  onSelectBatch: (batch: Batch | null) => void;
  onCreateBatch: () => void;
  onManageBatches?: () => void;
}

export function BatchSelector({
  batches,
  selectedBatch,
  onSelectBatch,
  onCreateBatch,
  onManageBatches,
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
          {/* Batch List - Limited to 5 items with scroll */}
          <div className="max-h-[320px] overflow-y-auto scrollbar-dark">
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
                  className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${
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

              {/* Manage Batches Button */}
              {onManageBatches && (
                <button
                  onClick={() => {
                    onManageBatches();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage Batches
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

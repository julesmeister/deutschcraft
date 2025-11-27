/**
 * DictionaryLookup Component
 * Autocomplete dictionary lookup for German-English translations
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useDictionarySearch } from '@/lib/hooks/useDictionary';
import { Search, BookOpen } from 'lucide-react';

interface DictionaryLookupProps {
  placeholder?: string;
  type?: 'german' | 'english' | 'both';
  minChars?: number;
  className?: string;
}

export function DictionaryLookup({
  placeholder = 'Type a word to translate...',
  type = 'both',
  minChars = 3,
  className = '',
}: DictionaryLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useDictionarySearch({
    query: searchTerm,
    type,
    exact: false,
    limit: 10,
    enabled: searchTerm.length >= minChars,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = data?.results || [];
  const hasResults = results.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Results Dropdown */}
      {showResults && searchTerm.length >= minChars && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Searching...
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No translations found for "{searchTerm}"
            </div>
          )}

          {!isLoading && hasResults && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {results.length} translation{results.length !== 1 ? 's' : ''}
              </div>
              <div className="divide-y divide-gray-100">
                {results.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      // Copy to clipboard or insert into textarea
                      navigator.clipboard.writeText(type === 'german' ? entry.english : entry.german);
                      setShowResults(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">
                          {entry.german}
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">
                          {entry.english}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-blue-500 mt-1">
                        Click to copy
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Helper Text */}
      {searchTerm.length > 0 && searchTerm.length < minChars && (
        <div className="mt-1.5 text-xs text-gray-500">
          Type at least {minChars} characters to search
        </div>
      )}
    </div>
  );
}

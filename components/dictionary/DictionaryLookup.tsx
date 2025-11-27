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
  onInsertText?: (text: string) => void;
}

export function DictionaryLookup({
  placeholder = 'Type a word to translate...',
  type = 'both',
  minChars = 3,
  className = '',
  onInsertText,
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
    <div ref={containerRef} className="w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400">
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
          className="w-full pl-7 pr-4 py-2 text-base bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
          style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
        />
      </div>

      {/* Results - Inline, seamlessly expanding */}
      {showResults && searchTerm.length >= minChars && (
        <div className="mt-3 w-full">
          {isLoading && (
            <div className="py-2 text-sm text-gray-500">
              Searching...
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="py-2 text-sm text-gray-500">
              No translations found for "{searchTerm}"
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="space-y-1 w-full">
              {results.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    // Insert translation at cursor position
                    const textToInsert = type === 'german' ? entry.english : entry.german;
                    if (onInsertText) {
                      onInsertText(textToInsert);
                    } else {
                      // Fallback to clipboard if no insert handler
                      navigator.clipboard.writeText(textToInsert);
                    }
                    setShowResults(false);
                    setSearchTerm('');
                  }}
                  className="w-full px-2 py-1.5 text-left hover:bg-gray-50 transition-colors group rounded block"
                >
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {entry.german}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {entry.english}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-blue-500 mt-0.5 flex-shrink-0">
                      Insert
                    </div>
                  </div>
                </button>
              ))}
            </div>
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

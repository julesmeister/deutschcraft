/**
 * Dictionary Page
 * Standalone German-English dictionary with advanced search
 */

'use client';

import { useState } from 'react';
import { useDictionarySearch } from '@/lib/hooks/useDictionary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Search, ArrowRight } from 'lucide-react';

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'german' | 'english' | 'both'>('both');
  const [forceSearch, setForceSearch] = useState(false);

  const shouldSearch = searchTerm.length >= 2 || (searchTerm.length >= 1 && forceSearch);

  const { data, isLoading } = useDictionarySearch({
    query: searchTerm,
    type: searchType,
    exact: false,
    limit: 50,
    enabled: shouldSearch,
  });

  const results = data?.results || [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.length >= 1) {
      setForceSearch(true);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Dictionary"
        subtitle="Search German-English translations from our database of 5,892+ entries"
      />

      <div className="container mx-auto px-6 mt-8">

        {/* Controls Section */}
        <div className="bg-white shadow-sm mb-6">
          <div className="space-y-4 p-4">
            {/* Search Type Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setSearchType('both')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  searchType === 'both'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Both Languages
              </button>
              <button
                onClick={() => setSearchType('german')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  searchType === 'german'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                German → English
              </button>
              <button
                onClick={() => setSearchType('english')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  searchType === 'english'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                English → German
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setForceSearch(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a word to search..."
                className="w-full pl-12 pr-4 py-3 text-lg border-none outline-none focus:ring-0"
              />
            </div>

            {/* Helper Text */}
            {searchTerm.length >= 1 && searchTerm.length < 2 && !forceSearch && (
              <p className="text-sm text-gray-500">
                Press Enter to search or type 1 more character
              </p>
            )}
          </div>
        </div>

        {/* Results Section */}
        {shouldSearch && (
          <div className="bg-white shadow-sm">
            {/* Results Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                  {isLoading ? 'Searching...' : `${results.length} ${results.length === 1 ? 'Result' : 'Results'}`}
                </h5>
                {searchTerm && (
                  <span className="text-sm text-gray-500">
                    for "{searchTerm}"
                  </span>
                )}
              </div>
            </div>

            {/* Results List */}
            <div className="p-4">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-gray-600">Searching dictionary...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-600 font-medium">No translations found</p>
                  <p className="text-sm text-gray-500 mt-1">Try a different word or spelling</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 hover:bg-gray-50 transition-colors group rounded"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="text-base font-semibold text-gray-900">
                              {entry.german}
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <div className="text-base text-gray-700">
                              {entry.english}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(entry.german)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          >
                            Copy DE
                          </button>
                          <button
                            onClick={() => handleCopy(entry.english)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          >
                            Copy EN
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show More Info */}
              {results.length >= 50 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    Showing first 50 results. Refine your search for more specific results.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!shouldSearch && (
          <div className="bg-white shadow-sm px-6 py-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start Searching
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Type a German or English word above to find translations. You can search with as little as one character by pressing Enter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

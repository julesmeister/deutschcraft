/**
 * Redemittel (Phrase Patterns) Page
 * Browse useful German phrases organized by CEFR level and conversation context
 */

'use client';

import { useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Search, Copy, Check, X, BookOpen, MessageCircle } from 'lucide-react';
import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';
import {
  redemittelData,
  CEFRLevel,
  ConversationContext,
  contextLabels,
  type Redemittel,
} from '@/lib/data/redemittel/redemittel-data';

const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function RedemittelPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'all'>('all');
  const [selectedContext, setSelectedContext] = useState<ConversationContext | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get unique contexts from data
  const availableContexts = useMemo(() => {
    const contexts = new Set<ConversationContext>();
    redemittelData.forEach(r => contexts.add(r.context));
    return Array.from(contexts).sort();
  }, []);

  // Filter redemittel based on search and filters
  const filteredRedemittel = useMemo(() => {
    return redemittelData.filter(r => {
      // Level filter
      if (selectedLevel !== 'all' && r.level !== selectedLevel) return false;

      // Context filter
      if (selectedContext !== 'all' && r.context !== selectedContext) return false;

      // Search filter
      if (searchTerm.length >= 2) {
        const lowerQuery = searchTerm.toLowerCase();
        return (
          r.german.toLowerCase().includes(lowerQuery) ||
          r.english.toLowerCase().includes(lowerQuery) ||
          r.context.toLowerCase().includes(lowerQuery) ||
          r.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      }

      return true;
    });
  }, [searchTerm, selectedLevel, selectedContext]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedLevel('all');
    setSelectedContext('all');
  };

  // Level color mapping
  const levelColors: Record<CEFRLevel, string> = {
    A1: 'bg-green-100 text-green-800',
    A2: 'bg-blue-100 text-blue-800',
    B1: 'bg-yellow-100 text-yellow-800',
    B2: 'bg-orange-100 text-orange-800',
    C1: 'bg-red-100 text-red-800',
    C2: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <DashboardHeader
        title="Redemittel"
        subtitle="Useful German phrase patterns for different conversation contexts and CEFR levels"
      />

      <div className="container mx-auto px-6 mt-8">
        {/* Controls Section */}
        <div className="bg-white shadow-sm mb-6">
          <div className="space-y-4 p-4">
            {/* Two Column Layout for Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CEFR Level Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CEFR Level
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLevel('all')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedLevel === 'all'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Levels
                  </button>
                  {cefrLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 text-sm font-semibold transition-colors ${
                        selectedLevel === level
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation Context Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Conversation Context
                </label>
                <CompactButtonDropdown
                  label={selectedContext === 'all' ? 'All Contexts' : contextLabels[selectedContext]}
                  icon={<MessageCircle className="w-4 h-4" />}
                  value={selectedContext}
                  onChange={(value) => setSelectedContext(value as ConversationContext | 'all')}
                  searchable={true}
                  searchPlaceholder="Search contexts..."
                  options={[
                    { value: 'all', label: 'All Contexts' },
                    ...availableContexts.map(context => ({
                      value: context,
                      label: contextLabels[context],
                    }))
                  ]}
                  buttonClassName="w-full justify-between"
                />
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search phrases, contexts, or tags..."
                className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 rounded outline-none focus:ring-2 focus:ring-gray-900"
              />
              {(searchTerm || selectedLevel !== 'all' || selectedContext !== 'all') && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear all filters"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white shadow-sm">
          {/* Results Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
                {filteredRedemittel.length} {filteredRedemittel.length === 1 ? 'Phrase' : 'Phrases'}
              </h5>
              {searchTerm && (
                <span className="text-sm text-gray-500">
                  for "{searchTerm}"
                </span>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="">
            {filteredRedemittel.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-600 font-medium">No phrases found</p>
                <p className="text-sm text-gray-500 mt-1">Try different filters or search terms</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredRedemittel.map((redemittel) => (
                  <div
                    key={redemittel.id}
                    className="py-3 px-6 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Main phrase - more compact */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-base font-bold text-gray-900">
                            {redemittel.german}
                          </div>
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded flex-shrink-0 ${levelColors[redemittel.level]}`}>
                            {redemittel.level}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          {redemittel.english}
                        </div>

                        {/* Example sentence - inline, smaller */}
                        {redemittel.example && (
                          <div className="text-xs text-gray-500 italic mt-1.5">
                            <BookOpen className="w-3 h-3 inline mr-1" />
                            "{redemittel.example}"
                            {redemittel.exampleTranslation && (
                              <span className="text-gray-400 ml-1">
                                — "{redemittel.exampleTranslation}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Tags - inline, smaller */}
                        {redemittel.tags && redemittel.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {redemittel.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right side: Category and Copy button stacked */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {/* Category */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MessageCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">{contextLabels[redemittel.context]}</span>
                        </div>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(redemittel.german, redemittel.id + '-de')}
                          className="px-2 py-0.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                        >
                          {copiedId === redemittel.id + '-de' ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span className="hidden sm:inline">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="hidden sm:inline">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        {filteredRedemittel.length === 0 && searchTerm.length === 0 && selectedLevel === 'all' && selectedContext === 'all' && (
          <div className="bg-white shadow-sm px-6 py-8 text-center mt-6">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Browse Redemittel
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Redemittel are useful phrase patterns that help you express ideas more naturally in German.
              Filter by CEFR level and conversation context to find the right phrases for your needs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

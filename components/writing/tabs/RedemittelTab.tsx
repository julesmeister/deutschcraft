'use client';

import { useMemo } from 'react';
import { Search, Copy, Check, MessageCircle } from 'lucide-react';
import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';
import {
  redemittelData,
  ConversationContext,
  contextLabels,
  type Redemittel,
  type CEFRLevel as RedemittelCEFRLevel,
} from '@/lib/data/redemittel/redemittel-data';

interface RedemittelTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedLevel: RedemittelCEFRLevel | 'all';
  setSelectedLevel: (level: RedemittelCEFRLevel | 'all') => void;
  selectedContext: ConversationContext | 'all';
  setSelectedContext: (context: ConversationContext | 'all') => void;
  copiedId: string | null;
  handleCopy: (text: string, id: string) => void;
  isExpanded: boolean;
}

export function RedemittelTab({
  searchTerm,
  setSearchTerm,
  selectedLevel,
  setSelectedLevel,
  selectedContext,
  setSelectedContext,
  copiedId,
  handleCopy,
  isExpanded,
}: RedemittelTabProps) {
  // Get unique contexts
  const availableContexts = useMemo(() => {
    const contexts = new Set<ConversationContext>();
    redemittelData.forEach(r => contexts.add(r.context));
    return Array.from(contexts).sort();
  }, []);

  // Filter redemittel
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
          r.context.toLowerCase().includes(lowerQuery)
        );
      }

      return true;
    });
  }, [searchTerm, selectedLevel, selectedContext]);

  const levelColors: Record<RedemittelCEFRLevel, string> = {
    'A1': 'bg-green-100 text-green-800',
    'A2': 'bg-blue-100 text-blue-800',
    'B1': 'bg-yellow-100 text-yellow-800',
    'B2': 'bg-orange-100 text-orange-800',
    'C1': 'bg-red-100 text-red-800',
    'C2': 'bg-purple-100 text-purple-800',
  };

  return (
    <>
      {/* Controls */}
      <div className="px-4 py-3 space-y-2 border-b border-gray-200 flex-shrink-0">
        {/* Search */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search phrases..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* CEFR Level Filter & Context Filter */}
        <div className="flex items-center justify-between gap-2">
          <CompactButtonDropdown
            label={selectedContext === 'all' ? 'All' : contextLabels[selectedContext]}
            icon={<MessageCircle className="w-3.5 h-3.5" />}
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
            buttonClassName="!text-[10px] !font-semibold !pl-2 !pr-2 !py-1 h-[26px] max-w-[120px] !bg-gray-100 hover:!bg-gray-200 [&>span:first-child]:!ml-0 [&>span:nth-child(2)]:truncate [&>span:nth-child(2)]:block [&>span:nth-child(2)]:max-w-[70px]"
          />
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
                selectedLevel === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as RedemittelCEFRLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-2 py-1 text-[10px] font-semibold transition-colors ${
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
      </div>

      {/* Results */}
      <div className="overflow-y-auto flex-1">
        {filteredRedemittel.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm text-gray-600 font-medium">No phrases found</p>
            <p className="text-xs text-gray-500 mt-1">Try different filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRedemittel.map((redemittel) => (
              <div
                key={redemittel.id}
                className="py-2 px-3 hover:bg-gray-50 transition-colors group"
              >
                {/* Main phrase */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {redemittel.german}
                      </div>
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded flex-shrink-0 ${levelColors[redemittel.level]}`}>
                        {redemittel.level}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {redemittel.english}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(redemittel.german, redemittel.id)}
                    className="px-2 py-1 text-[10px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors flex items-center gap-1 flex-shrink-0"
                  >
                    {copiedId === redemittel.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span className="hidden sm:inline">OK</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Example (only in expanded mode) */}
                {isExpanded && redemittel.example && (
                  <div className="mt-1.5 pt-1.5 border-t border-gray-100">
                    <div className="text-[10px] text-gray-500 italic">
                      &quot;{redemittel.example}&quot;
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg flex-shrink-0">
        <p className="text-[10px] text-gray-500 text-center">
          {filteredRedemittel.length} {filteredRedemittel.length === 1 ? 'phrase' : 'phrases'}
        </p>
      </div>
    </>
  );
}

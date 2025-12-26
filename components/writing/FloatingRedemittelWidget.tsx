/**
 * Floating Redemittel Widget
 * A fixed bottom-right widget for browsing and searching Redemittel during writing exercises
 */

'use client';

import { useState } from 'react';
import { X, ChevronUp, ChevronDown, BookOpen, Bookmark } from 'lucide-react';
import {
  ConversationContext,
  type CEFRLevel as RedemittelCEFRLevel,
} from '@/lib/data/redemittel/redemittel-data';
import { CEFRLevel } from '@/lib/models/cefr';
import { useSavedVocabulary, useRemoveSavedVocabularyMutation } from '@/lib/hooks/useSavedVocabulary';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useToast } from '@/lib/hooks/useToast';
import { RedemittelTab } from './tabs/RedemittelTab';
import { SavedVocabTab } from './tabs/SavedVocabTab';

interface FloatingRedemittelWidgetProps {
  currentLevel?: CEFRLevel;
}

export function FloatingRedemittelWidget({ currentLevel }: FloatingRedemittelWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'redemittel' | 'saved'>('redemittel');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<RedemittelCEFRLevel | 'all'>('all');
  const [selectedContext, setSelectedContext] = useState<ConversationContext | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Saved vocabulary hooks
  const { session } = useFirebaseAuth();
  const toast = useToast();
  const { data: savedVocabulary = [], isLoading: savedLoading } = useSavedVocabulary(
    session?.user?.email,
    true // Include completed words
  );
  const removeMutation = useRemoveSavedVocabularyMutation();

  // Separate incomplete and completed words
  const incompleteWords = savedVocabulary.filter(sv => !sv.completed);
  const completedWords = savedVocabulary.filter(sv => sv.completed);

  console.log('FloatingRedemittelWidget rendered with level:', currentLevel);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handlers for saved vocabulary
  const handleRemove = async (wordId: string) => {
    if (!session?.user?.email) return;

    try {
      await removeMutation.mutateAsync({
        userId: session.user.email,
        wordId,
      });
      toast.success('Removed from saved vocabulary');
    } catch (error) {
      console.error('Error removing saved word:', error);
      toast.error('Failed to remove word');
    }
  };

  const handleCopySavedWord = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 font-semibold"
      >
        <BookOpen className="w-5 h-5" />
        <span>Redemittel</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 flex flex-col ${
        isExpanded ? 'w-[500px] h-[600px]' : 'w-[400px] h-[450px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          {activeTab === 'redemittel' ? (
            <>
              <BookOpen className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-gray-900">Redemittel</h3>
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-gray-900">Saved Vocab</h3>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <button
          onClick={() => setActiveTab('redemittel')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'redemittel'
              ? 'text-gray-900 border-b-2 border-gray-900 -mb-[2px]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Redemittel
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'saved'
              ? 'text-gray-900 border-b-2 border-gray-900 -mb-[2px]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Saved Vocab
          {incompleteWords.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
              {incompleteWords.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'redemittel' ? (
        <RedemittelTab
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedContext={selectedContext}
          setSelectedContext={setSelectedContext}
          copiedId={copiedId}
          handleCopy={handleCopy}
          isExpanded={isExpanded}
        />
      ) : (
        <SavedVocabTab
          savedVocabulary={savedVocabulary}
          isLoading={savedLoading}
          incompleteWords={incompleteWords}
          completedWords={completedWords}
          handleRemove={handleRemove}
          handleCopySavedWord={handleCopySavedWord}
        />
      )}
    </div>
  );
}

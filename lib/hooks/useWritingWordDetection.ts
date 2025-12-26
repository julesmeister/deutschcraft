/**
 * Hook for detecting and confirming saved vocabulary words in writing submissions
 */

import { useState } from 'react';
import { SavedVocabulary } from '@/lib/models/savedVocabulary';
import { detectSavedWordsInText } from '@/lib/services/flashcardService';
import { useBulkIncrementMutation } from './useSavedVocabulary';
import { useToast } from './useToast';

export function useWritingWordDetection() {
  const [detectedWords, setDetectedWords] = useState<SavedVocabulary[]>([]);
  const bulkIncrementMutation = useBulkIncrementMutation();
  const toast = useToast();

  /**
   * Detect saved words in submitted text
   */
  const detectWords = async (userId: string | undefined, text: string) => {
    if (!userId || !text) {
      setDetectedWords([]);
      return;
    }

    try {
      const detected = await detectSavedWordsInText(userId, text);
      setDetectedWords(detected);
    } catch (error) {
      console.error('Error detecting saved words:', error);
      // Don't show error to user - word detection is optional
      setDetectedWords([]);
    }
  };

  /**
   * Confirm and increment usage for selected words
   */
  const confirmUsedWords = async (userId: string | undefined, wordIds: string[]) => {
    if (!userId) return;

    try {
      const results = await bulkIncrementMutation.mutateAsync({
        userId,
        wordIds,
      });

      const completedCount = results.filter(r => r.completed).length;

      if (completedCount > 0) {
        toast.success(`🎉 ${completedCount} word(s) completed! Great job!`);
      } else {
        toast.success(`Progress updated for ${wordIds.length} word(s)`);
      }

      setDetectedWords([]);
    } catch (error) {
      console.error('Error updating word progress:', error);
      toast.error('Failed to update word progress');
    }
  };

  /**
   * Clear detected words
   */
  const clearDetectedWords = () => {
    setDetectedWords([]);
  };

  return {
    detectedWords,
    detectWords,
    confirmUsedWords,
    clearDetectedWords,
  };
}

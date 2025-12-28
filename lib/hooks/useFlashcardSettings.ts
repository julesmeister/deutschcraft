/**
 * Flashcard Settings Hook
 * Manages user's flashcard preferences
 */

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { getFlashcardSettings, updateFlashcardSettings } from '@/lib/services/user';

export interface FlashcardSettings {
  cardsPerSession: number;
  autoPlayAudio: boolean;
  showExamples: boolean;
  randomizeOrder: boolean;
}

const DEFAULT_SETTINGS: FlashcardSettings = {
  cardsPerSession: 20,
  autoPlayAudio: false,
  showExamples: true,
  randomizeOrder: true,
};

export function useFlashcardSettings() {
  const { session } = useFirebaseAuth();
  const [settings, setSettings] = useState<FlashcardSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings using service layer
  useEffect(() => {
    const loadSettings = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const userSettings = await getFlashcardSettings(session.user.email);
        if (userSettings) {
          setSettings(userSettings);
        }
      } catch (error) {
        console.error('Error loading flashcard settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [session?.user?.email]);

  // Save settings using service layer
  const updateSettingsLocal = async (newSettings: Partial<FlashcardSettings>) => {
    if (!session?.user?.email) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setIsSaving(true);

    try {
      await updateFlashcardSettings(session.user.email, updatedSettings);
    } catch (error) {
      console.error('Error saving flashcard settings:', error);
      // Revert on error
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings: updateSettingsLocal,
  };
}

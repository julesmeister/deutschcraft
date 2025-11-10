/**
 * Flashcard Settings Hook
 * Manages user's flashcard preferences
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from './useFirebaseAuth';

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

  // Load settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', session.user.email);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.flashcardSettings) {
            setSettings(userData.flashcardSettings);
          }
        }
      } catch (error) {
        console.error('Error loading flashcard settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [session?.user?.email]);

  // Save settings to Firestore
  const updateSettings = async (newSettings: Partial<FlashcardSettings>) => {
    if (!session?.user?.email) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setIsSaving(true);

    try {
      const userRef = doc(db, 'users', session.user.email);
      await updateDoc(userRef, {
        flashcardSettings: updatedSettings,
        updatedAt: Date.now(),
      });
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
    updateSettings,
  };
}

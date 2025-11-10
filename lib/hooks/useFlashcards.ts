/**
 * Flashcard Hooks
 * Real-time hooks for flashcards, vocabulary, and progress tracking
 */

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Flashcard,
  FlashcardProgress,
  VocabularyWord,
  StudyProgress,
} from '@/lib/models';
import { CEFRLevel } from '@/lib/models/cefr';
import { getCategoriesForLevel } from '@/lib/data/vocabulary-categories';

/**
 * Get flashcards by level and optional category
 */
export function useFlashcards(level?: CEFRLevel, category?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!level) {
      setFlashcards([]);
      setIsLoading(false);
      return;
    }

    const fetchFlashcards = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const flashcardsRef = collection(db, 'flashcards');
        let q = query(
          flashcardsRef,
          where('level', '==', level),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Flashcard[];

        // Filter by category if provided
        let filtered = data;
        if (category) {
          // We'll need to join with vocabulary to filter by tags
          const vocabPromises = data.map(async (flashcard) => {
            const vocabDoc = await getDoc(doc(db, 'vocabulary', flashcard.wordId));
            if (vocabDoc.exists()) {
              const vocabData = vocabDoc.data() as VocabularyWord;
              return vocabData.tags?.includes(category) ? flashcard : null;
            }
            return null;
          });

          const results = await Promise.all(vocabPromises);
          filtered = results.filter(f => f !== null) as Flashcard[];
        }

        setFlashcards(filtered);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [level, category]);

  return { flashcards, isLoading, isError };
}

/**
 * Get student's flashcard progress
 */
export function useFlashcardProgress(userId?: string) {
  const [progress, setProgress] = useState<FlashcardProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        const progressRef = collection(db, 'flashcard-progress');
        const q = query(
          progressRef,
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data()) as FlashcardProgress[];

        setProgress(data);
      } catch (error) {
        console.error('Error fetching flashcard progress:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  return { progress, isLoading, isError };
}

/**
 * Get student's study progress stats
 */
export function useStudyStats(userId?: string, refreshKey?: number) {
  const [stats, setStats] = useState({
    totalCards: 0,
    cardsLearned: 0,
    streak: 0,
    accuracy: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!userId) {
      console.log('📊 [useStudyStats] No userId provided');
      setIsLoading(false);
      return;
    }

    console.log('📊 [useStudyStats] Setting up real-time listeners for userId:', userId);

    setIsLoading(true);
    setIsError(false);

    // Set up real-time listener for flashcard progress
    const progressRef = collection(db, 'flashcard-progress');
    const progressQuery = query(
      progressRef,
      where('userId', '==', userId)
    );

    console.log('📊 [useStudyStats] Creating listener for flashcard-progress collection');

    const unsubscribeProgress = onSnapshot(
      progressQuery,
      (progressSnapshot) => {
        console.log('📊 [useStudyStats] Flashcard progress updated:', {
          docsCount: progressSnapshot.docs.length,
          timestamp: new Date().toISOString(),
        });

        const progressData = progressSnapshot.docs.map(doc => doc.data()) as FlashcardProgress[];

        // Calculate stats from flashcard progress
        const totalCards = progressData.length;
        const cardsLearned = progressData.filter(p => p.masteryLevel >= 70).length;

        const totalCorrect = progressData.reduce((sum, p) => sum + (p.correctCount || 0), 0);
        const totalIncorrect = progressData.reduce((sum, p) => sum + (p.incorrectCount || 0), 0);
        const totalAttempts = totalCorrect + totalIncorrect;
        const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

        console.log('📊 [useStudyStats] Calculated from flashcard-progress:', {
          totalCards,
          cardsLearned,
          totalCorrect,
          totalIncorrect,
          totalAttempts,
          accuracy,
        });

        // Set up listener for study progress (for streak calculation)
        const studyProgressRef = collection(db, 'progress');
        const studyQuery = query(
          studyProgressRef,
          where('userId', '==', userId),
          orderBy('date', 'desc'),
          limit(30)
        );

        console.log('📊 [useStudyStats] Creating listener for progress collection');

        const unsubscribeStudy = onSnapshot(
          studyQuery,
          (studySnapshot) => {
            console.log('📊 [useStudyStats] Study progress updated:', {
              docsCount: studySnapshot.docs.length,
              timestamp: new Date().toISOString(),
            });

            const studyData = studySnapshot.docs.map(doc => doc.data()) as StudyProgress[];

            console.log('📊 [useStudyStats] Study data:', studyData);

            // Calculate streak (consecutive days with activity)
            let streak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < studyData.length; i++) {
              const progressDate = new Date(studyData[i].date);
              progressDate.setHours(0, 0, 0, 0);

              const expectedDate = new Date(today);
              expectedDate.setDate(today.getDate() - i);

              if (progressDate.getTime() === expectedDate.getTime()) {
                streak++;
              } else {
                break;
              }
            }

            console.log('📊 [useStudyStats] Final stats:', {
              totalCards,
              cardsLearned,
              streak,
              accuracy,
            });

            setStats({
              totalCards,
              cardsLearned,
              streak,
              accuracy,
            });
            setIsLoading(false);
          },
          (error) => {
            console.error('❌ [useStudyStats] Error in study progress listener:', error);
            setIsError(true);
            setIsLoading(false);
          }
        );

        // Store the study listener unsubscribe function
        return () => unsubscribeStudy();
      },
      (error) => {
        console.error('❌ [useStudyStats] Error in flashcard progress listener:', error);
        setIsError(true);
        setIsLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log('📊 [useStudyStats] Cleaning up listeners');
      unsubscribeProgress();
    };
  }, [userId, refreshKey]);

  return { stats, isLoading, isError };
}

/**
 * Get vocabulary categories with card counts
 */
export function useVocabularyCategories(level?: CEFRLevel) {
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    cardCount: number;
    icon: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setIsError(false);

        // If no level specified, return empty
        if (!level) {
          setCategories([]);
          setIsLoading(false);
          return;
        }

        // Get predefined categories for this level
        const predefinedCategories = getCategoriesForLevel(level);

        // Get all vocabulary words to count actual cards
        const vocabRef = collection(db, 'vocabulary');
        const q = query(vocabRef, where('level', '==', level));
        const snapshot = await getDocs(q);
        const words = snapshot.docs.map(doc => doc.data()) as VocabularyWord[];

        // Count words per category (tag)
        const categoryCountMap = new Map<string, number>();
        words.forEach(word => {
          word.tags?.forEach(tag => {
            categoryCountMap.set(tag, (categoryCountMap.get(tag) || 0) + 1);
          });
        });

        // Merge predefined categories with actual counts
        const categoriesArray = predefinedCategories.map(category => ({
          id: category.id,
          name: category.name,
          cardCount: categoryCountMap.get(category.id) || 0,
          icon: category.icon,
          description: category.description,
          priority: category.priority,
        }));

        // Sort by priority (or card count if you prefer)
        categoriesArray.sort((a, b) => a.priority - b.priority);

        setCategories(categoriesArray);
      } catch (error) {
        console.error('Error fetching vocabulary categories:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [level]);

  return { categories, isLoading, isError };
}

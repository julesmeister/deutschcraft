import { useState, useMemo } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';
import { calculateSRSData } from '@/lib/utils/srsAlgorithm';

interface GrammarReview {
  sentenceId: string;
  ruleId: string;
  masteryLevel: number;
  nextReviewDate?: number; // timestamp
  lastReviewDate?: number; // timestamp
  repetitions?: number;
  easeFactor?: number;
  interval?: number;
  correctCount?: number;
  incorrectCount?: number;
  consecutiveCorrect?: number;
  consecutiveIncorrect?: number;
  firstSeenAt?: number;
  createdAt?: number;
}

interface SentenceDataMap {
  sentences?: any[];
}

interface UseGrammarPracticeSessionProps {
  selectedLevel: CEFRLevel;
  sentenceDataMap: Record<string, SentenceDataMap>;
  reviews: GrammarReview[];
  session: any;
  saveReview: (params: { reviewId: string; reviewData: any }) => void;
  refetchReviews: () => Promise<any>;
}

export function useGrammarPracticeSession({
  selectedLevel,
  sentenceDataMap,
  reviews,
  session,
  saveReview,
  refetchReviews,
}: UseGrammarPracticeSessionProps) {
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceSentences, setPracticeSentences] = useState<any[]>([]);

  // Calculate due sentences count
  const dueSentencesCount = useMemo(() => {
    const now = Date.now();
    return reviews.filter(review => {
      if (!review.nextReviewDate) return false;
      return review.nextReviewDate <= now;
    }).length;
  }, [reviews]);

  const handlePracticeComplete = async (results: { sentenceId: string; difficulty: string }[]) => {
    if (!session?.user?.email) {
      console.error('Cannot save: No user session');
      setIsPracticeMode(false);
      setPracticeSentences([]);
      return null;
    }

    try {
      // Save each sentence review to database
      for (const result of results) {
        const { sentenceId, difficulty } = result;

        // Get existing review or create new one
        const existingReview = reviews.find(r => r.sentenceId === sentenceId);

        // Find the actual sentence to get its ruleId
        const sentenceData = sentenceDataMap[selectedLevel];
        const sentence = sentenceData?.sentences?.find((s: any) => s.sentenceId === sentenceId);
        const actualRuleId = sentence?.ruleId || '';

        // Prepare current progress object for SRS calculation
        const currentProgress = existingReview ? {
          masteryLevel: existingReview.masteryLevel || 0,
          nextReviewDate: existingReview.nextReviewDate || Date.now(),
          repetitions: existingReview.repetitions || 0,
          easeFactor: existingReview.easeFactor || 2.5,
          interval: existingReview.interval || 0,
          consecutiveCorrect: 0,
          consecutiveIncorrect: 0,
          lapseCount: 0,
          lastLapseDate: null,
          state: 'review' as const,
        } : null;

        // Calculate SRS interval based on difficulty
        const srsResult = calculateSRSData(currentProgress, difficulty as any, selectedLevel);

        // Validate SRS result
        if (!srsResult || typeof srsResult.interval !== 'number' || isNaN(srsResult.interval)) {
          console.error('Invalid SRS result:', srsResult);
          continue; // Skip this sentence
        }

        // Calculate next review date using the timestamp from srsResult
        const nextReviewDate = new Date(srsResult.nextReviewDate);

        // Validate the date
        if (isNaN(nextReviewDate.getTime())) {
          console.error('Invalid date from SRS result:', srsResult.nextReviewDate);
          continue;
        }

        // Prepare review data
        const reviewId = `${session.user.email}_${sentenceId}`;
        const now = Date.now();

        // Determine if this is correct or incorrect based on difficulty
        const isCorrect = difficulty === 'easy' || difficulty === 'good' || difficulty === 'expert';
        const isIncorrect = difficulty === 'again' || difficulty === 'hard';

        const reviewData = {
          userId: session.user.email,
          sentenceId: sentenceId,
          ruleId: actualRuleId,
          level: selectedLevel,
          masteryLevel: srsResult.masteryLevel || 0,
          repetitions: srsResult.repetitions || 0,
          easeFactor: srsResult.easeFactor || 2.5,
          interval: srsResult.interval, // days until next review
          nextReviewDate: nextReviewDate.getTime(), // timestamp
          lastReviewDate: now, // timestamp

          // Performance tracking
          correctCount: (existingReview?.correctCount || 0) + (isCorrect ? 1 : 0),
          incorrectCount: (existingReview?.incorrectCount || 0) + (isIncorrect ? 1 : 0),
          consecutiveCorrect: isCorrect ? (existingReview?.consecutiveCorrect || 0) + 1 : 0,
          consecutiveIncorrect: isIncorrect ? (existingReview?.consecutiveIncorrect || 0) + 1 : 0,

          // First seen tracking
          firstSeenAt: existingReview?.firstSeenAt || now,
          createdAt: existingReview?.createdAt || now,
        };

        // Save to database
        await saveReview({ reviewId, reviewData });
      }

      // Refetch reviews to update UI
      await refetchReviews();

      console.log('Practice session saved successfully:', results.length, 'sentences');
    } catch (error) {
      console.error('Failed to save practice session:', error);
    }

    // Return to rules list
    setIsPracticeMode(false);
    setPracticeSentences([]);
    return null;
  };

  const handleStartPractice = () => {
    if (!session?.user?.email) {
      alert('Please log in to practice');
      return null;
    }

    // Get sentences that are due for review (SRS mode)
    const now = Date.now();
    const dueReviews = reviews.filter((review) => {
      if (!review.nextReviewDate) return false;
      return review.nextReviewDate <= now;
    });

    if (dueReviews.length === 0) {
      alert('No sentences due for review! Practice some grammar rules first.');
      return null;
    }

    // Load all sentence data for the current level
    const sentenceData = sentenceDataMap[selectedLevel];
    if (!sentenceData || !sentenceData.sentences) {
      alert('No sentence data available for this level');
      return null;
    }

    // Get the actual sentence objects for due reviews
    const dueSentenceObjects = dueReviews
      .map(review => {
        return sentenceData.sentences.find((s: any) => s.sentenceId === review.sentenceId);
      })
      .filter(Boolean); // Remove any undefined

    if (dueSentenceObjects.length === 0) {
      alert('Could not load due sentences');
      return null;
    }

    // Shuffle for variety
    const shuffled = [...dueSentenceObjects].sort(() => Math.random() - 0.5);

    // Limit to 20 sentences per session
    const sessionSentences = shuffled.slice(0, 20);

    // Set practice sentences
    setPracticeSentences(sessionSentences);
    setIsPracticeMode(true);

    console.log(`Starting practice with ${sessionSentences.length} due sentences`);
    return 'practice-mode'; // Return a dummy rule ID
  };

  return {
    isPracticeMode,
    practiceSentences,
    dueSentencesCount,
    setIsPracticeMode,
    setPracticeSentences,
    handlePracticeComplete,
    handleStartPractice,
  };
}

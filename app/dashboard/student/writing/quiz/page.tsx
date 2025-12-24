'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useQuizSentences } from '@/lib/hooks/useQuizSentences';
import { QuizBlank } from '@/lib/models/writing';
import { checkAnswer } from '@/lib/utils/quizGenerator';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { useToast } from '@/components/ui/toast';
import { calculateQuizPoints } from '@/lib/hooks/useQuizStats';
import { recordMiniExerciseAttempt } from '@/lib/services/writing/smartMiniExerciseService';
import { saveMiniQuizResult } from '@/lib/services/writing/miniQuizService';
import { useUserQuizStats } from '@/lib/hooks/useReviewQuizzes';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';
import confetti from 'canvas-confetti';

export default function WritingQuizPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const { sentences, isLoading, refresh } = useQuizSentences(session?.user?.email, 10);
  const { data: quizStats } = useUserQuizStats(session?.user?.email || null);
  const toast = useToast();

  // Simplified state: each sentence has only 1 blank, so just map sentenceIndex -> answer
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [sentencesLength, setSentencesLength] = useState(0);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Reset state when sentences change (using length to avoid infinite loop)
  useEffect(() => {
    if (sentences.length !== sentencesLength) {
      setAnswers({});
      setShowResults(false);
      setResults({});
      setTotalPoints(0);
      setSentencesLength(sentences.length);
    }
  }, [sentences.length, sentencesLength]);

  const handleAnswerChange = (sentenceIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [sentenceIndex]: value,
    }));
  };

  const handleCheckAnswers = async () => {
    if (isSaving) return;

    let correctCount = 0;
    const totalBlanks = sentences.length; // Each sentence has exactly 1 blank
    const newResults: Record<number, boolean> = {};

    // Check all answers (1 blank per sentence)
    sentences.forEach((sentence, sentenceIndex) => {
      const userAnswer = answers[sentenceIndex] || '';
      const blank = sentence.blanks[0]; // Only 1 blank per sentence
      const isCorrect = checkAnswer(userAnswer, blank.correctAnswer);

      newResults[sentenceIndex] = isCorrect;

      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setShowResults(true);

    // Calculate points (10 points per blank)
    const points = calculateQuizPoints(correctCount, totalBlanks);
    setTotalPoints(points);

    // Show results toast
    const accuracy = Math.round((correctCount / totalBlanks) * 100);
    if (accuracy === 100) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
      toast.success(`Perfect score! +${points} points! 🎉`, { duration: 4000 });
    } else if (accuracy >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Great job! ${accuracy}% correct. +${points} points!`, { duration: 4000 });
    } else if (accuracy >= 60) {
      toast.info(`Good effort! ${accuracy}% correct. +${points} points.`, { duration: 4000 });
    } else {
      toast.warning(`Keep practicing! ${accuracy}% correct. +${points} points.`, { duration: 4000 });
    }

    // Save attempts to database
    setIsSaving(true);
    try {
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        const userAnswer = answers[i] || '';
        const blank = sentence.blanks[0];
        const isCorrect = checkAnswer(userAnswer, blank.correctAnswer);

        // Build answers object
        const sentenceAnswers = { 0: userAnswer };

        // Calculate points using the same system as MiniBlankExercise (10 points max per sentence)
        const sentencePoints = calculateQuizPoints(isCorrect ? 1 : 0, 1);

        // Only record to mini-exercise-attempts if sentence has a valid ID (not random fallback)
        if (sentence.sentenceId && !sentence.sentenceId.startsWith('random_')) {
          await recordMiniExerciseAttempt(
            sentence.sentenceId,
            session?.user?.email || '',
            sentenceAnswers,
            isCorrect ? 1 : 0,
            1,
            sentencePoints
          );
        }

        // Always save to quiz system for stats tracking
        await saveMiniQuizResult(
          session?.user?.email || '',
          sentence.submissionId,
          sentence.sentence,
          sentence.blanks,
          sentenceAnswers,
          sentencePoints,
          isCorrect ? 1 : 0
        );
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewQuiz = () => {
    refresh();
  };

  // Check if all blanks are filled (1 per sentence)
  const allBlanksFilled = sentences.every((_, sentenceIndex) => {
    return (answers[sentenceIndex] || '').trim().length > 0;
  });

  // Render a sentence with a single blank
  const renderSentence = (sentenceText: string, blank: QuizBlank, sentenceIndex: number) => {
    const parts: Array<{ type: 'text' | 'blank'; content: string }> = [];

    // Add text before blank
    if (blank.position > 0) {
      parts.push({
        type: 'text',
        content: sentenceText.substring(0, blank.position),
      });
    }

    // Add blank
    parts.push({
      type: 'blank',
      content: blank.correctAnswer,
    });

    // Add remaining text
    // Skip past the word AND any trailing punctuation
    let endPosition = blank.position + blank.correctAnswer.length;
    // Skip punctuation that was part of the original word
    while (endPosition < sentenceText.length && /[^\w\s]/.test(sentenceText[endPosition])) {
      endPosition++;
    }

    if (endPosition < sentenceText.length) {
      parts.push({
        type: 'text',
        content: sentenceText.substring(endPosition),
      });
    }

    const userAnswer = answers[sentenceIndex] || '';
    const isCorrect = showResults && results[sentenceIndex];
    const isIncorrect = showResults && !results[sentenceIndex];

    return (
      <div className="text-base leading-relaxed">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index} className="text-gray-900">{part.content}</span>;
          } else {
            return (
              <span key={index} className="inline-flex items-center gap-1 mx-1 my-1 relative">
                <input
                  ref={(el) => { inputRefs.current[sentenceIndex] = el; }}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => handleAnswerChange(sentenceIndex, e.target.value)}
                  disabled={showResults}
                  className={`text-sm font-bold text-center transition-all outline-none ${
                    isCorrect
                      ? 'bg-piku-mint text-gray-900 px-1.5 py-1 rounded-md'
                      : isIncorrect
                      ? 'bg-red-100 text-red-700 px-1.5 py-1 rounded-l-md'
                      : 'bg-gray-100 hover:bg-gray-150 focus:bg-white focus:ring-2 focus:ring-blue-400 rounded-md px-1.5 py-1'
                  }`}
                  style={{ width: `${Math.max(part.content.length * 9, 50)}px` }}
                />
                {!showResults && inputRefs.current[sentenceIndex] && (
                  <GermanCharAutocomplete
                    textareaRef={{ current: inputRefs.current[sentenceIndex] }}
                    content={userAnswer}
                    onContentChange={(value) => handleAnswerChange(sentenceIndex, value)}
                  />
                )}
                {isIncorrect && (
                  <span className="inline-flex items-center justify-center px-1.5 py-1 bg-piku-mint text-gray-900 text-sm font-bold rounded-r-md">
                    {part.content}
                  </span>
                )}
              </span>
            );
          }
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Review Quiz"
          subtitle="Loading your personalized quiz..."
          backButton={{
            label: 'Back to Writing',
            onClick: () => router.push('/dashboard/student/writing')
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Review Quiz"
          subtitle="No quiz available yet"
          backButton={{
            label: 'Back to Writing',
            onClick: () => router.push('/dashboard/student/writing')
          }}
        />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 p-8 text-center">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Quiz Available</h3>
            <p className="text-gray-600 mb-6">
              Complete writing exercises to unlock review quizzes based on your corrected work!
            </p>
            <ActionButton
              onClick={() => router.push('/dashboard/student/writing')}
              variant="purple"
              icon={<ActionButtonIcons.ArrowLeft />}
            >
              Go to Writing Exercises
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  const totalBlanksCount = sentences.length; // 1 blank per sentence
  const progress = showResults
    ? `${totalPoints} points earned • ${Object.values(results).filter(Boolean).length}/${totalBlanksCount} correct`
    : quizStats && quizStats.totalQuizzes > 0
    ? `${sentences.length} questions • Total: ${quizStats.totalPoints} points`
    : `${sentences.length} questions`;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Review Quiz"
        subtitle={progress}
        backButton={{
          label: 'Back to Writing',
          onClick: () => router.push('/dashboard/student/writing')
        }}
        actions={
          !showResults ? (
            <ActionButton
              onClick={handleCheckAnswers}
              disabled={!allBlanksFilled || isSaving}
              variant="purple"
              icon={<ActionButtonIcons.Check />}
              className="min-w-[180px]"
            >
              {isSaving ? 'Saving...' : 'Check Answers'}
            </ActionButton>
          ) : (
            <ActionButton
              onClick={handleNewQuiz}
              variant="mint"
              icon={<ActionButtonIcons.Play />}
              className="min-w-[180px]"
            >
              New Quiz
            </ActionButton>
          )
        }
      />

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 p-6">
          {/* Instructions */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Instructions</h3>
                <p className="text-sm text-gray-600">
                  Fill in all the blanks with the correct words from your corrected writing exercises.
                  {!showResults && ' Click "Check Answers" when you\'re done.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sentences */}
          <div className="space-y-6">
            {sentences.map((sentence, index) => (
              <div key={index} className="pb-6 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 bg-gray-100 text-gray-700 text-sm font-bold rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {sentence.exerciseType} • {new Date(sentence.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Context: Previous sentence */}
                {sentence.contextBefore && (
                  <div className="mb-2 text-sm text-gray-500 italic">
                    {sentence.contextBefore}
                  </div>
                )}

                {/* Main sentence with blank */}
                {renderSentence(sentence.sentence, sentence.blanks[0], index)}

                {/* Context: Next sentence */}
                {sentence.contextAfter && (
                  <div className="mt-2 text-sm text-gray-500 italic">
                    {sentence.contextAfter}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Results Summary */}
          {showResults && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Quiz Complete!</h4>
                    <p className="text-xs text-gray-600">
                      You earned {totalPoints} points • {Object.values(results).filter(Boolean).length}/{totalBlanksCount} correct ({Math.round((Object.values(results).filter(Boolean).length / totalBlanksCount) * 100)}% accuracy)
                    </p>
                  </div>
                  <div className="text-3xl">
                    {Object.values(results).filter(Boolean).length === totalBlanksCount ? '🎉' : '💪'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

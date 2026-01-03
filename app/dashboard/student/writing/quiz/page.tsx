'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useQuizSentences } from '@/lib/hooks/useQuizSentences';
import { checkAnswer } from '@/lib/utils/quizGenerator';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { useToast } from '@/components/ui/toast';
import { calculateQuizPoints } from '@/lib/hooks/useQuizStats';
import { recordMiniExerciseAttempt } from '@/lib/services/writing/smartMiniExercise';
import { saveMiniQuizResult } from '@/lib/services/writing/miniQuizService';
import { useUserQuizStats } from '@/lib/hooks/useReviewQuizzes';
import confetti from 'canvas-confetti';
import { QuizLoadingState } from './QuizLoadingState';
import { QuizEmptyState } from './QuizEmptyState';
import { QuizInstructions } from './QuizInstructions';
import { QuizResultsSummary } from './QuizResultsSummary';
import { QuizSentenceRenderer } from './QuizSentenceRenderer';

export default function WritingQuizPage() {
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const { sentences, isLoading, refresh } = useQuizSentences(session?.user?.email, 10);
  const { data: quizStats } = useUserQuizStats(session?.user?.email || null);
  const toast = useToast();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [sentencesLength, setSentencesLength] = useState(0);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

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
    const totalBlanks = sentences.length;
    const newResults: Record<number, boolean> = {};

    sentences.forEach((sentence, sentenceIndex) => {
      const userAnswer = answers[sentenceIndex] || '';
      const blank = sentence.blanks[0];
      const isCorrect = checkAnswer(userAnswer, blank.correctAnswer);

      newResults[sentenceIndex] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setShowResults(true);

    const points = calculateQuizPoints(correctCount, totalBlanks);
    setTotalPoints(points);

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

    setIsSaving(true);
    try {
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        const userAnswer = answers[i] || '';
        const blank = sentence.blanks[0];
        const isCorrect = checkAnswer(userAnswer, blank.correctAnswer);

        const sentenceAnswers = { 0: userAnswer };
        const sentencePoints = calculateQuizPoints(isCorrect ? 1 : 0, 1);

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

        await saveMiniQuizResult(
          session?.user?.email || '',
          sentence.submissionId,
          sentence.sentence,
          sentence.blanks,
          sentenceAnswers,
          sentencePoints,
          isCorrect ? 1 : 0,
          sentence.exerciseId,
          sentence.exerciseTitle
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

  const navigateToWriting = () => router.push('/dashboard/student/writing');

  const allBlanksFilled = sentences.every((_, sentenceIndex) => {
    return (answers[sentenceIndex] || '').trim().length > 0;
  });

  if (isLoading) {
    return <QuizLoadingState onBack={navigateToWriting} />;
  }

  if (sentences.length === 0) {
    return <QuizEmptyState onBack={navigateToWriting} />;
  }

  const totalBlanksCount = sentences.length;
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
          onClick: navigateToWriting
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
          <QuizInstructions showResults={showResults} />

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

                {sentence.contextBefore && (
                  <div className="mb-2 text-sm text-gray-500 italic">
                    {sentence.contextBefore}
                  </div>
                )}

                <QuizSentenceRenderer
                  sentenceText={sentence.sentence}
                  blank={sentence.blanks[0]}
                  sentenceIndex={index}
                  userAnswer={answers[index] || ''}
                  showResults={showResults}
                  isCorrect={showResults && results[index]}
                  isIncorrect={showResults && !results[index]}
                  inputRef={inputRefs.current[index] || null}
                  onAnswerChange={handleAnswerChange}
                  onInputRef={(idx, el) => { inputRefs.current[idx] = el; }}
                />

                {sentence.contextAfter && (
                  <div className="mt-2 text-sm text-gray-500 italic">
                    {sentence.contextAfter}
                  </div>
                )}
              </div>
            ))}
          </div>

          {showResults && (
            <QuizResultsSummary
              totalPoints={totalPoints}
              correctCount={Object.values(results).filter(Boolean).length}
              totalCount={totalBlanksCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}

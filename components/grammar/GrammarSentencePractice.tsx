"use client";

import { useState, useEffect, useRef } from "react";
import { DifficultyButtons } from "@/components/flashcards/DifficultyButtons";
import { GrammarSessionSummary } from "@/components/grammar/GrammarSessionSummary";
import { GrammarProgress } from "@/components/grammar/GrammarProgress";
import { GrammarInputField } from "@/components/grammar/GrammarInputField";
import { GrammarAnswerComparison } from "@/components/grammar/GrammarAnswerComparison";
import { GrammarEmptyState } from "@/components/grammar/GrammarEmptyState";

interface GrammarSentence {
  sentenceId: string;
  ruleId: string;
  english: string;
  german: string;
  hints?: string[];
  keywords?: string[];
  difficulty?: number;
}

interface GrammarSentencePracticeProps {
  sentences: GrammarSentence[];
  ruleTitle: string;
  onComplete: (
    results: { sentenceId: string; difficulty: string }[],
    shouldExit?: boolean
  ) => void;
  onProgress?: (results: { sentenceId: string; difficulty: string }[]) => void;
}

type DifficultyLevel = "again" | "hard" | "good" | "easy" | "expert";

export function GrammarSentencePractice({
  sentences,
  ruleTitle,
  onComplete,
  onProgress,
}: GrammarSentencePracticeProps) {
  const [practiceSentences, setPracticeSentences] = useState(sentences);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    { sentenceId: string; difficulty: string }[]
  >([]);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSentence = practiceSentences[currentIndex];

  useEffect(() => {
    setPracticeSentences(sentences);
    setCurrentIndex(0);
    setSessionResults([]);
    setShowSummary(false);
    setUserAnswer("");
    setIsRevealed(false);
  }, [sentences]);

  useEffect(() => {
    if (!isRevealed) {
      inputRef.current?.focus();
    }
  }, [currentIndex, isRevealed]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isRevealed) {
        if (e.key === "Enter") {
          if (userAnswer.trim()) {
            e.preventDefault();
            handleRevealAnswer();
          }
        }
      } else {
        if (e.key >= "1" && e.key <= "5") {
          e.preventDefault();
          const difficulties: DifficultyLevel[] = [
            "again",
            "hard",
            "good",
            "easy",
            "expert",
          ];
          handleDifficulty(difficulties[parseInt(e.key) - 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRevealed, userAnswer]);

  const handleRevealAnswer = () => {
    setIsRevealed(true);
  };

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;]/g, "")
      .replace(/\s+/g, " ");
  };

  const isCorrect = (): boolean => {
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(currentSentence.german);
    return normalizedUser === normalizedCorrect;
  };

  const handleDifficulty = (difficulty: DifficultyLevel) => {
    const newResults = [
      ...sessionResults,
      { sentenceId: currentSentence.sentenceId, difficulty },
    ];
    setSessionResults(newResults);
    onProgress?.(newResults);

    if (currentIndex < practiceSentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setIsRevealed(false);
    } else {
      setShowSummary(true);
    }
  };

  const handleEndPractice = () => {
    setShowSummary(true);
  };

  const calculateStats = () => {
    const stats = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
      expert: 0,
    };

    sessionResults.forEach((result) => {
      if (result.difficulty in stats) {
        stats[result.difficulty as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const handleReviewMistakes = () => {
    onComplete(sessionResults, false);

    const mistakeSentenceIds = sessionResults
      .filter((r) => r.difficulty === "again" || r.difficulty === "hard")
      .map((r) => r.sentenceId);

    const mistakes = practiceSentences.filter((s) =>
      mistakeSentenceIds.includes(s.sentenceId)
    );

    if (mistakes.length > 0) {
      setPracticeSentences(mistakes);
      setCurrentIndex(0);
      setUserAnswer("");
      setIsRevealed(false);
      setShowSummary(false);
      setSessionResults([]);
    } else {
      alert("No difficult sentences to review!");
    }
  };

  const handleReviewAll = () => {
    handleReviewMistakes();
  };

  const handleFinishSession = () => {
    onComplete(sessionResults, true);
  };

  const handleRetry = () => {
    setIsRevealed(false);
    setUserAnswer("");
  };

  if (showSummary) {
    const stats = calculateStats();
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    return (
      <GrammarSessionSummary
        stats={stats}
        totalSentences={practiceSentences.length}
        timeSpent={timeSpent}
        onReviewMistakes={handleReviewMistakes}
        onReviewAll={handleReviewAll}
        onFinish={handleFinishSession}
      />
    );
  }

  if (!currentSentence) {
    return <GrammarEmptyState />;
  }

  return (
    <div>
      <GrammarProgress
        ruleTitle={ruleTitle}
        currentIndex={currentIndex}
        totalSentences={practiceSentences.length}
        hasResults={sessionResults.length > 0}
        onEndPractice={handleEndPractice}
      />

      <div className="bg-white shadow-sm overflow-hidden mb-6">
        <div className="p-8 sm:p-12">
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Translate to German
            </h4>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-relaxed">
              {currentSentence.english}
            </p>
          </div>

          {!isRevealed && (
            <GrammarInputField
              value={userAnswer}
              onChange={setUserAnswer}
              onSubmit={handleRevealAnswer}
              inputRef={inputRef}
            />
          )}

          {isRevealed && (
            <GrammarAnswerComparison
              userAnswer={userAnswer}
              correctAnswer={currentSentence.german}
              isCorrect={isCorrect()}
              hints={currentSentence.hints}
              onRetry={handleRetry}
            />
          )}
        </div>

        <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-200">
          <DifficultyButtons
            isFlipped={isRevealed}
            onDifficulty={handleDifficulty}
            onShowAnswer={handleRevealAnswer}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useCurrentStudent } from "@/lib/hooks/useUsers";
import { getUserInfo } from "@/lib/utils/userHelpers";
import { MiniBlankExercise } from "@/components/dashboard/MiniBlankExercise";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";
import {
  generateMarkedWordQuiz,
  getSRSStats,
  MarkedWordQuizItem,
  SRSStats,
} from "@/lib/services/writing/markedWordQuizService";
import { useExercisesWithOverrides } from "@/lib/hooks/useExercisesWithOverrides";
import { CEFRLevel } from "@/lib/models/cefr";
import confetti from "canvas-confetti";
import { savePracticeResult } from "@/lib/actions/quizActions";
import { SRSStatsDisplay } from "@/components/dashboard/SRSStatsDisplay";

export default function LevelPracticePage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId } = getUserInfo(currentUser, session);
  const queryClient = useQueryClient();

  const levelBook = params.levelBook as string;
  const [levelPart, bookType] = levelBook.split("-") as [string, "AB" | "KB"];
  const level = levelPart as CEFRLevel;

  // Load ALL lessons for this level
  const { lessons } = useExercisesWithOverrides(
    level,
    bookType,
    undefined,
    userId
  );

  // Collect all exercise IDs from all lessons
  const exerciseIds = useMemo(() => {
    if (!lessons || lessons.length === 0) return [];
    return lessons.flatMap((lesson) =>
      lesson.exercises.map((e) => e.exerciseId)
    );
  }, [lessons]);

  const [quizItems, setQuizItems] = useState<MarkedWordQuizItem[]>([]);
  const [srsStats, setSrsStats] = useState<SRSStats | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (!userId || exerciseIds.length === 0 || hasLoaded) return;

    async function loadQuiz() {
      const { items, stats } = await generateMarkedWordQuiz(
        userId,
        exerciseIds
      );
      setQuizItems(items);
      setSrsStats(stats);
      setIsLoading(false);
      setHasLoaded(true);
    }

    loadQuiz();
  }, [userId, exerciseIds, hasLoaded]);

  const handleComplete = async (
    points: number,
    correct: number,
    total: number,
    sentenceId?: string
  ) => {
    // Update local state
    setTotalPoints((prev) => prev + points);
    if (correct === 1) {
      setCorrectCount((prev) => prev + 1);
    }

    const currentItem = quizItems[currentIndex];

    // Save to database
    if (userId && currentItem) {
      try {
        await savePracticeResult({
          userId,
          exerciseId: currentItem.exerciseId,
          sentence: currentItem.sentence,
          blank: currentItem.blank,
          isCorrect: correct === 1,
          points,
          itemNumber: currentItem.itemNumber,
          wordStartIndex: currentItem.blank.position,
        });

        queryClient.invalidateQueries({
          queryKey: ["user-quiz-stats", userId],
        });

        // Update SRS stats
        const newStats = await getSRSStats(userId, exerciseIds);
        setSrsStats(newStats);
      } catch (error) {
        // Error handling silently as requested
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < quizItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Final question - show celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Practice All Lektions"
          subtitle="Loading..."
          backButton={{
            label: "Back to Answer Hub",
            href: `/dashboard/student/answer-hub`,
          }}
        />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="text-gray-600">Loading practice quiz...</div>
        </div>
      </div>
    );
  }

  if (quizItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader
          title="Practice All Lektions"
          subtitle={`${level} ${bookType}`}
          backButton={{
            label: "Back to Answer Hub",
            href: `/dashboard/student/answer-hub`,
          }}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Words Marked for Practice
            </h3>
            <p className="text-gray-600 mb-6">
              Mark words in your answers to create practice quizzes!
            </p>
            <ActionButton
              variant="purple"
              className="!w-auto px-8"
              icon={<ActionButtonIcons.ArrowRight />}
              onClick={() => router.push(`/dashboard/student/answer-hub`)}
            >
              Back to Answer Hub
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = quizItems[currentIndex];

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Practice Complete!
          </h3>
          <ActionButton
            variant="purple"
            onClick={() => router.push(`/dashboard/student/answer-hub`)}
          >
            Return to Answer Hub
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Practice All Lektions"
        subtitle={`${level} ${bookType} • Item ${currentIndex + 1} of ${
          quizItems.length
        }`}
        backButton={{
          label: "Back to Answer Hub",
          href: `/dashboard/student/answer-hub`,
        }}
      />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="mb-4 bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-gray-300 font-medium mb-1">
                Progress
              </div>
              <div className="text-lg font-bold text-white">
                {currentIndex + 1} / {quizItems.length}
              </div>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div>
              <div className="text-xs text-gray-300 font-medium mb-1">
                Points
              </div>
              <div className="text-lg font-bold text-piku-yellow-light">
                {totalPoints}
              </div>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div>
              <div className="text-xs text-gray-300 font-medium mb-1">
                Correct
              </div>
              <div className="text-lg font-bold text-piku-mint">
                {correctCount}
              </div>
            </div>
            {srsStats && (
              <>
                <div className="h-10 w-px bg-white/20"></div>
                <SRSStatsDisplay stats={srsStats} variant="dark" />
              </>
            )}
          </div>
        </div>

        <MiniBlankExercise
          key={`${currentItem.sentenceId}-${currentIndex}`}
          sentence={currentItem.sentence}
          blanks={[currentItem.blank]}
          onComplete={handleComplete}
          onRefresh={handleNext}
          userId={userId}
          exerciseType="marked-word-practice"
          sentenceId={currentItem.sentenceId}
          hasNext={currentIndex < quizItems.length - 1}
          showFullQuizButton={false}
        />
      </div>
    </div>
  );
}

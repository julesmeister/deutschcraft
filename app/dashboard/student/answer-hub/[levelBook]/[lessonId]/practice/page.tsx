"use client";

import { useState, useEffect } from "react";
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
  MarkedWordQuizItem,
} from "@/lib/services/writing/markedWordQuizService";
import { useLessonWithOverrides } from "@/lib/hooks/useExercisesWithOverrides";
import { CEFRLevel } from "@/lib/models/cefr";
import confetti from "canvas-confetti";
import { savePracticeResult } from "@/lib/actions/quizActions";

export default function LessonPracticePage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useFirebaseAuth();
  const { student: currentUser } = useCurrentStudent(
    session?.user?.email || null
  );
  const { userId } = getUserInfo(currentUser, session);
  const queryClient = useQueryClient();

  const levelBook = params.levelBook as string;
  const lessonId = params.lessonId as string;

  const [levelPart, bookType] = levelBook.split("-") as [string, "AB" | "KB"];
  const level = levelPart as CEFRLevel;
  const lessonNumber = parseInt(lessonId.replace("L", ""));

  const { lesson } = useLessonWithOverrides(
    level,
    bookType,
    lessonNumber,
    userId
  );
  const exerciseIds = lesson?.exercises.map((e) => e.exerciseId) || [];

  const [quizItems, setQuizItems] = useState<MarkedWordQuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (!userId || exerciseIds.length === 0) return;

    async function loadQuiz() {
      const items = await generateMarkedWordQuiz(userId, exerciseIds);
      setQuizItems(items);
      setIsLoading(false);
    }

    loadQuiz();
  }, [userId, exerciseIds]);

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
        });

        queryClient.invalidateQueries({
          queryKey: ["user-quiz-stats", userId],
        });
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
          title="Practice Marked Words"
          subtitle="Loading..."
          backButton={{
            label: "Back to Summary",
            href: `/dashboard/student/answer-hub/${levelBook}/${lessonId}/summary`,
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
          title="Practice Marked Words"
          subtitle={`${level} ${bookType} Lektion ${lessonNumber}`}
          backButton={{
            label: "Back to Summary",
            href: `/dashboard/student/answer-hub/${levelBook}/${lessonId}/summary`,
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
              onClick={() =>
                router.push(
                  `/dashboard/student/answer-hub/${levelBook}/${lessonId}/summary`
                )
              }
            >
              Go to Summary
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = quizItems[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Practice Marked Words"
        subtitle={`${level} ${bookType} Lektion ${lessonNumber} • Item ${
          currentIndex + 1
        } of ${quizItems.length}`}
        backButton={{
          label: "Back to Summary",
          href: `/dashboard/student/answer-hub/${levelBook}/${lessonId}/summary`,
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
          </div>
        </div>

        <MiniBlankExercise
          sentence={currentItem.sentence}
          blanks={[currentItem.blank]}
          onComplete={handleComplete}
          onRefresh={handleNext}
          userId={userId}
          exerciseType="marked-word-practice"
          sentenceId={currentItem.sentenceId}
        />
      </div>
    </div>
  );
}

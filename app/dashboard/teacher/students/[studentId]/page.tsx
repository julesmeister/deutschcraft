"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FlashcardStatsSection } from "@/components/dashboard/FlashcardStatsSection";
import { WritingStatsSection } from "@/components/dashboard/WritingStatsSection";
import { GrammarStatsSection } from "@/components/dashboard/GrammarStatsSection";
import { AnswerHubStatsSection } from "@/components/dashboard/AnswerHubStatsSection";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import { CategoryProgressSection } from "@/components/dashboard/CategoryProgressSection";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useStudyStats } from "@/lib/hooks/useFlashcards";
import {
  useWritingStats,
  useStudentSubmissions,
} from "@/lib/hooks/useWritingExercises";
import {
  useGrammarReviews,
  useGrammarRules,
} from "@/lib/hooks/useGrammarExercises";
import { useSessionPagination } from "@/lib/hooks/useSessionPagination";
import { useUserQuizzes } from "@/lib/hooks/useReviewQuizzes";
import { useAnswerHubStats } from "@/lib/hooks/useAnswerHubStats";
import { getUser } from "@/lib/services/user";
import { getBatch } from "@/lib/services/batchService";
import { User, getUserFullName } from "@/lib/models/user";
import { CREATIVE_EXERCISES } from "@/lib/data/creativeExercises";
import { EMAIL_TEMPLATES } from "@/lib/data/emailTemplates";
import { LETTER_TEMPLATES } from "@/lib/data/letterTemplates";
import { TRANSLATION_EXERCISES } from "@/lib/data/translationExercises";
import grammarA1 from "@/lib/data/grammar/levels/a1.json";
import grammarA2 from "@/lib/data/grammar/levels/a2.json";
import grammarB1 from "@/lib/data/grammar/levels/b1.json";
import grammarB2 from "@/lib/data/grammar/levels/b2.json";
import grammarC1 from "@/lib/data/grammar/levels/c1.json";
import grammarC2 from "@/lib/data/grammar/levels/c2.json";

// Import textbook exercises
import textbookA1_1 from "@/lib/data/exercises/a1-1-arbeitsbuch.json";
import textbookA1_2 from "@/lib/data/exercises/a1-2-arbeitsbuch.json";
import textbookA2_1 from "@/lib/data/exercises/a2-1-arbeitsbuch.json";
import textbookA2_2 from "@/lib/data/exercises/a2-2-arbeitsbuch.json";
import textbookB1_1 from "@/lib/data/exercises/b1-1-arbeitsbuch.json";
import textbookB1_2 from "@/lib/data/exercises/b1-2-arbeitsbuch.json";
import textbookB1_1_KB from "@/lib/data/exercises/b1-1-kursbuch.json";

interface StudentProfilePageProps {
  params: Promise<{ studentId: string }>;
}

interface StudentData {
  email: string;
  name: string;
  currentLevel: string;
  photoURL?: string;
  batchName?: string;
}

export default function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { session } = useFirebaseAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "flashcards" | "writing" | "grammatik" | "answerhub"
  >("flashcards");

  // Get student's study stats
  // We need to use the student.email from the loaded data, NOT the state variable which might be stale
  // or the hook might not react quickly enough to the state change.
  // Actually, useStudyStats will react to the state change, but let's make sure we pass the correct email.
  const { stats } = useStudyStats(student?.email);

  // Get student's writing stats
  const { data: writingStats } = useWritingStats(student?.email);
  const { data: rawWritingSubmissions = [] } = useStudentSubmissions(
    student?.email
  );
  const { data: userQuizzes = [] } = useUserQuizzes(student?.email);

  // Get student's grammar reviews
  const { reviews: grammarReviews } = useGrammarReviews(student?.email);
  const { rules: grammarRules } = useGrammarRules();

  // Get student's Answer Hub stats
  const {
    stats: answerHubStats,
    exerciseSummaries,
    isLoading: isLoadingAnswerHub,
  } = useAnswerHubStats(student?.email || null);

  // Create a map of all exercise titles for quick lookup
  const exerciseTitleMap = useMemo(() => {
    const map = new Map<string, string>();

    // Add Creative Exercises
    CREATIVE_EXERCISES.forEach((ex) => {
      if (ex.exerciseId) map.set(ex.exerciseId, ex.title);
    });

    // Add Email Templates (use id)
    EMAIL_TEMPLATES.forEach((ex) => {
      if (ex.id) map.set(ex.id, ex.title);
    });

    // Add Letter Templates (use id)
    LETTER_TEMPLATES.forEach((ex) => {
      if (ex.id) map.set(ex.id, ex.title);
    });

    // Add Translation Exercises
    TRANSLATION_EXERCISES.forEach((ex) => {
      if (ex.exerciseId) map.set(ex.exerciseId, ex.title);
    });

    return map;
  }, []);

  // Create a map of all grammar rule titles from static JSONs
  const grammarRuleTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    const allRules = [
      ...(grammarA1.rules || []),
      ...(grammarA2.rules || []),
      ...(grammarB1.rules || []),
      ...(grammarB2.rules || []),
      ...(grammarC1.rules || []),
      ...(grammarC2.rules || []),
    ];

    allRules.forEach((rule: any) => {
      if (rule.id) map.set(rule.id, rule.title);
    });

    return map;
  }, []);

  // Normalize and combine writing submissions with quiz attempts
  const writingSubmissions = useMemo(() => {
    if (!rawWritingSubmissions || rawWritingSubmissions.length === 0) {
      return [];
    }

    // Serialize and deserialize to break all object references
    const serialized = JSON.parse(JSON.stringify(rawWritingSubmissions));

    return serialized.map((submission: any) => {
      // Normalize teacherScore
      if (
        submission.teacherScore &&
        typeof submission.teacherScore === "object"
      ) {
        submission.teacherScore = submission.teacherScore.overallScore || 0;
      }

      // Enrich with title from map if missing
      if (!submission.exerciseTitle && submission.exerciseId) {
        const foundTitle = exerciseTitleMap.get(submission.exerciseId);
        if (foundTitle) {
          submission.exerciseTitle = foundTitle;
        }
      }

      return submission;
    });
  }, [rawWritingSubmissions, exerciseTitleMap]);

  // Convert grammar reviews to activity items (grouped by date)
  const grammarSessions = useMemo(() => {
    if (!grammarReviews || grammarReviews.length === 0) return [];

    // Group reviews by date (lastReviewDate)
    const sessionsByDate = grammarReviews
      .filter((review) => review.lastReviewDate)
      .reduce((acc, review) => {
        const dateKey = new Date(review.lastReviewDate!).toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(review);
        return acc;
      }, {} as Record<string, typeof grammarReviews>);

    // Convert to session objects
    return Object.entries(sessionsByDate).map(([dateKey, reviews]) => {
      // Find topics covered in this session
      const ruleIds = Array.from(new Set(reviews.map((r) => r.ruleId)));
      const topics = ruleIds
        .map((id) => {
          if (!id) return undefined;

          // 1. Try static map first (Primary source)
          const staticTitle = grammarRuleTitleMap.get(id);
          if (staticTitle) return staticTitle;

          // 2. Try to match by ruleId or id (in case of data format mismatch)
          const rule = grammarRules.find(
            (r) => r.ruleId === id || (r as any).id === id
          );

          if (rule?.title) return rule.title;

          // Fallback: Format the ID if rule not found (e.g. "a1-articles-definite" -> "Articles Definite")
          return id
            .replace(/^[a-z]\d-/, "") // Remove level prefix like a1-, b2-
            .replace(/-/g, " ") // Replace dashes with spaces
            .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize words
        })
        .filter((t): t is string => !!t);

      return {
        id: `grammar-${dateKey}`,
        type: "grammar" as const,
        title: topics.length > 0 ? topics[0] : "Grammar Practice", // Temporary title, formatted in component
        timestamp: Math.max(...reviews.map((r) => r.updatedAt)),
        score: Math.round(
          reviews.reduce((acc, r) => acc + (r.masteryLevel || 0), 0) /
            reviews.length
        ),
        details: {
          sentenceCount: reviews.length,
          masteryLevel: Math.round(
            reviews.reduce((acc, r) => acc + (r.masteryLevel || 0), 0) /
              reviews.length
          ),
        },
        // Grammar specific props
        isGrammarSession: true,
        submissionId: `grammar-${dateKey}`, // Fake ID for key
        sentenceCount: reviews.length,
        submittedAt: Math.max(...reviews.map((r) => r.updatedAt)),
        averageMastery: Math.round(
          reviews.reduce((acc, r) => acc + (r.masteryLevel || 0), 0) /
            reviews.length
        ),
        topics: topics.length > 0 ? topics : undefined,
      };
    });
  }, [grammarReviews, grammarRules, grammarRuleTitleMap]);

  // Combine submissions, quizzes, and grammar sessions, sorted by date
  const combinedActivity = useMemo(() => {
    const items = [
      ...writingSubmissions,
      // Only include completed quizzes
      ...userQuizzes
        .filter((quiz) => quiz.status === "completed")
        .map((quiz) => {
          // Find the original submission to get the title
          // 1. Try exact submission match
          let submission = writingSubmissions.find(
            (s: any) => s.submissionId === quiz.submissionId
          );

          // 2. If not found, try to find ANY submission for this exercise (fallback)
          if (!submission && quiz.exerciseId) {
            submission = writingSubmissions.find(
              (s: any) => s.exerciseId === quiz.exerciseId
            );
          }

          // 3. Look up title from static exercise definitions (Ultimate fallback/Primary source if submission missing)
          const staticTitle = quiz.exerciseId
            ? exerciseTitleMap.get(quiz.exerciseId)
            : undefined;

          const title =
            staticTitle || submission?.exerciseTitle || submission?.title;

          return {
            ...quiz,
            isQuiz: true,
            submissionId: quiz.quizId,
            exerciseType: "quiz" as const,
            status: "reviewed" as const,
            wordCount: quiz.totalBlanks,
            submittedAt: quiz.completedAt || quiz.startedAt,
            updatedAt: quiz.updatedAt,
            // Pass the original exercise title to the quiz object
            exerciseTitle: title,
          };
        }),
      ...grammarSessions,
    ];

    // Sort by date (most recent first)
    return items.sort((a, b) => {
      const dateA = a.submittedAt || a.updatedAt || 0;
      const dateB = b.submittedAt || b.updatedAt || 0;
      return dateB - dateA;
    });
  }, [writingSubmissions, userQuizzes, grammarSessions, exerciseTitleMap]);

  // Pagination for flashcard sessions
  const sessionPagination = useSessionPagination(student?.email, 8);

  useEffect(() => {
    async function loadStudentData() {
      try {
        setIsLoading(true);

        // Decode the URL-encoded email
        const studentEmail = decodeURIComponent(resolvedParams.studentId);

        // Fetch student data using service layer
        const userData = await getUser(studentEmail);

        if (userData) {
          // Handle both formats: {name: "Full Name"} OR {firstName: "First", lastName: "Last"}
          const displayName =
            (userData as any).name || getUserFullName(userData);

          // Fetch batch information if student has a batchId
          let batchName: string | undefined = undefined;
          if (userData.batchId) {
            try {
              const batchData = await getBatch(userData.batchId);
              batchName = batchData?.name;
            } catch (error) {
              console.error("Error fetching batch data:", error);
            }
          }

          setStudent({
            email: userData.email,
            name: displayName,
            currentLevel: userData.cefrLevel || "A1",
            photoURL: userData.photoURL,
            batchName,
          });
        }
      } catch (error) {
        console.error("Error loading student data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (resolvedParams.studentId) {
      loadStudentData();
    }
  }, [resolvedParams.studentId]);

  // Fetch first page when student is loaded
  useEffect(() => {
    if (student?.email) {
      sessionPagination.fetchPage(1);
    }
  }, [student?.email]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-piku-purple"></div>
          <p className="mt-4 text-gray-600 font-semibold">
            Loading student profile...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-red-200 rounded-2xl p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Student Not Found
          </h2>
          <p className="text-gray-600 mb-4">Could not load student data</p>
          <button
            onClick={() => router.push("/dashboard/teacher")}
            className="px-6 py-3 bg-piku-purple text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={student.name || "Unknown Student"}
        subtitle={`Current Level: ${student.currentLevel}`}
        backButton={{
          label: "Back to Dashboard",
          onClick: () => router.push("/dashboard/teacher"),
        }}
        avatar={{
          src: student.photoURL,
          initial: (student.name || student.email || "?")
            .charAt(0)
            .toUpperCase(),
          subtitle: student.batchName || student.email,
          subtitleAsBadge: !!student.batchName, // Show as badge only if it's a batch name
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Activity Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`px-6 py-3 font-bold transition ${
                activeTab === "flashcards"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📚 Flashcards
            </button>
            <button
              onClick={() => setActiveTab("writing")}
              className={`px-6 py-3 font-bold transition ${
                activeTab === "writing"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ✍️ Writing
            </button>
            <button
              onClick={() => setActiveTab("grammatik")}
              className={`px-6 py-3 font-bold transition ${
                activeTab === "grammatik"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📖 Grammatik
            </button>
            <button
              onClick={() => setActiveTab("answerhub")}
              className={`px-6 py-3 font-bold transition ${
                activeTab === "answerhub"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📝 Answer Hub
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          {activeTab === "flashcards" ? (
            <FlashcardStatsSection stats={stats} />
          ) : activeTab === "writing" ? (
            <WritingStatsSection
              writingStats={writingStats}
              studentEmail={student?.email}
            />
          ) : activeTab === "grammatik" ? (
            <GrammarStatsSection studentEmail={student?.email} />
          ) : activeTab === "answerhub" ? (
            <AnswerHubStatsSection
              stats={answerHubStats}
              isLoading={isLoadingAnswerHub}
            />
          ) : null}
        </div>

        {/* Category Progress (only for flashcards tab) */}
        {activeTab === "flashcards" && student?.email && (
          <div className="mb-8">
            <CategoryProgressSection userId={student.email} />
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            {activeTab === "flashcards"
              ? "Recent Flashcard Sessions"
              : activeTab === "writing"
              ? "Recent Writing Submissions"
              : activeTab === "grammatik"
              ? "Recent Grammar Practice Sessions"
              : activeTab === "answerhub"
              ? "Exercise Timeline"
              : "Recent Activity"}
          </h2>

          <RecentActivityTimeline
            activeTab={activeTab}
            recentSessions={sessionPagination.sessions}
            writingSubmissions={combinedActivity}
            answerHubExercises={exerciseSummaries}
            currentPage={sessionPagination.currentPage}
            onPageChange={sessionPagination.goToPage}
            isLoading={sessionPagination.isLoading}
            hasMore={sessionPagination.hasMore}
          />
        </div>
      </div>
    </div>
  );
}

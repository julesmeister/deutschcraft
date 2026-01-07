"use client";

import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useRouter } from "next/navigation";
import { CEFRLevel } from "@/lib/models/cefr";

interface LessonErrorProps {
  error: Error | null;
  lessonNumber: number;
  level: CEFRLevel;
  bookType: string;
}

export function LessonError({ error, lessonNumber, level, bookType }: LessonErrorProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DashboardHeader
        title="Answer Hub 📝"
        subtitle="Lesson not found"
        backButton={{
          label: "Back to Lessons",
          onClick: () => router.push("/dashboard/student/answer-hub"),
        }}
      />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Lesson Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            {error?.message ||
              `Could not find Lektion ${lessonNumber} for ${level} ${bookType}`}
          </p>
          <Link
            href="/dashboard/student/answer-hub"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Lessons
          </Link>
        </div>
      </div>
    </div>
  );
}

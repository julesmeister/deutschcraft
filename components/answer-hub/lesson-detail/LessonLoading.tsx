"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CatLoader } from "@/components/ui/CatLoader";
import { useRouter } from "next/navigation";

export function LessonLoading() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DashboardHeader
        title="Answer Hub 📝"
        subtitle="Loading lesson..."
        backButton={{
          label: "Back to Lessons",
          onClick: () => router.push("/dashboard/student/answer-hub"),
        }}
      />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <CatLoader message="Loading lesson exercises..." size="md" />
      </div>
    </div>
  );
}

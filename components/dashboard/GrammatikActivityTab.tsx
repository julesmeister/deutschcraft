/**
 * GrammatikActivityTab Component
 * Displays grammar practice session timeline
 */

import {
  ActivityTimeline,
  ActivityItem,
} from "@/components/ui/activity/ActivityTimeline";
import { Pagination } from "@/components/ui/Pagination";

interface GrammarSession {
  isGrammarSession: boolean;
  submissionId: string;
  sentenceCount: number;
  submittedAt: number;
  averageMastery: number;
  topics?: string[];
}

interface GrammatikActivityTabProps {
  grammarSessions: GrammarSession[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export function GrammatikActivityTab({
  grammarSessions,
  currentPage,
  onPageChange,
  itemsPerPage = 8,
}: GrammatikActivityTabProps) {
  if (grammarSessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg font-semibold">No grammar practice sessions</p>
        <p className="text-sm mt-2">
          This student hasn't practiced grammar yet
        </p>
      </div>
    );
  }

  // Calculate pagination for grammar
  const totalPagesGrammar = Math.ceil(grammarSessions.length / itemsPerPage);
  const startIndexGrammar = (currentPage - 1) * itemsPerPage;
  const endIndexGrammar = startIndexGrammar + itemsPerPage;
  const paginatedGrammar = grammarSessions.slice(
    startIndexGrammar,
    endIndexGrammar
  );

  return (
    <>
      <ActivityTimeline
        items={paginatedGrammar.map((session) => {
          const masteryColor =
            session.averageMastery >= 80
              ? "green"
              : session.averageMastery >= 60
              ? "amber"
              : "red";

          // Format title based on topics
          let title = "Grammar Practice Session";
          if (session.topics && session.topics.length > 0) {
            if (session.topics.length === 1) {
              title = session.topics[0];
            } else if (session.topics.length === 2) {
              title = `${session.topics[0]} & ${session.topics[1]}`;
            } else {
              title = `${session.topics[0]}, ${session.topics[1]} +${
                session.topics.length - 2
              } more`;
            }
          }

          return {
            id: session.submissionId,
            icon: <span className="text-white text-sm">📖</span>,
            iconColor: "bg-green-600",
            title: title,
            description: `Practiced ${session.sentenceCount} sentences`,
            timestamp: new Date(session.submittedAt).toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
            tags: [
              {
                label: `${session.sentenceCount} sentences`,
                color: "blue",
              },
              {
                label: `${session.averageMastery}% Mastery`,
                color: masteryColor,
                icon: session.averageMastery >= 80 ? "✓" : undefined,
              },
              {
                label: "Completed",
                color: "green",
                icon: "✓",
              },
            ],
          } as ActivityItem;
        })}
        showConnector={true}
        showPagination={false}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPagesGrammar}
        onPageChange={onPageChange}
      />
    </>
  );
}

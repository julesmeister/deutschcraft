/**
 * AnswerHubActivityTab Component
 * Displays exercise timeline for Answer Hub
 */

import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { Pagination } from '@/components/ui/Pagination';
import { ExerciseActivitySummary } from '@/lib/models/answerHub';

interface AnswerHubActivityTabProps {
  exerciseSummaries: ExerciseActivitySummary[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export function AnswerHubActivityTab({
  exerciseSummaries,
  currentPage,
  onPageChange,
  itemsPerPage = 8,
}: AnswerHubActivityTabProps) {
  if (exerciseSummaries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg font-semibold">No exercise activity</p>
        <p className="text-sm mt-2">This student hasn't submitted any answers yet</p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(exerciseSummaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExercises = exerciseSummaries.slice(startIndex, endIndex);

  return (
    <>
      <ActivityTimeline
        items={paginatedExercises.map((exercise) => {
          const statusColor =
            exercise.status === 'completed' ? 'green' :
            exercise.status === 'in_progress' ? 'blue' : 'gray';

          const bookIcon = exercise.bookType === 'AB' ? '📘' : '📕';

          return {
            id: exercise.exerciseId,
            icon: <span className="text-white text-sm">{bookIcon}</span>,
            iconColor: exercise.bookType === 'AB' ? 'bg-blue-600' : 'bg-red-600',
            title: exercise.exerciseTitle,
            description: `Lektion ${exercise.lessonNumber} • ${exercise.itemsSubmitted} answer${exercise.itemsSubmitted !== 1 ? 's' : ''} submitted`,
            timestamp: new Date(exercise.lastActivityAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            tags: [
              {
                label: exercise.level,
                color: 'purple',
              },
              {
                label: exercise.bookType === 'AB' ? 'Arbeitsbuch' : 'Kursbuch',
                color: 'blue',
              },
              {
                label: exercise.status === 'completed' ? 'Completed' : 'In Progress',
                color: statusColor,
                icon: exercise.status === 'completed' ? '✓' : undefined,
              },
              {
                label: `${exercise.completionPercentage}%`,
                color: exercise.completionPercentage === 100 ? 'green' : 'amber',
              },
            ],
            metadata: (
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <a
                    href={`/dashboard/student/answer-hub/${exercise.level}-${exercise.bookType}/L${exercise.lessonNumber}/${exercise.exerciseId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View Exercise →
                  </a>
                </div>
              </div>
            ),
          } as ActivityItem;
        })}
        showConnector={true}
        showPagination={false}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface QuizEmptyStateProps {
  onBack: () => void;
}

export function QuizEmptyState({ onBack }: QuizEmptyStateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Review Quiz"
        subtitle="No quiz available yet"
        backButton={{
          label: 'Back to Writing',
          onClick: onBack
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
            onClick={onBack}
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

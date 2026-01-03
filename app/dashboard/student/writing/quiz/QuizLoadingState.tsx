import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

interface QuizLoadingStateProps {
  onBack: () => void;
}

export function QuizLoadingState({ onBack }: QuizLoadingStateProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Review Quiz"
        subtitle="Loading your personalized quiz..."
        backButton={{
          label: 'Back to Writing',
          onClick: onBack
        }}
      />
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

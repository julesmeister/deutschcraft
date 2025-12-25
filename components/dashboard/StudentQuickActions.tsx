import { useRouter } from 'next/navigation';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

interface StudentQuickActionsProps {
  cardsReady: number;
  wordsToReview: number;
  writingExercises?: number;
}

export function StudentQuickActions({ cardsReady, wordsToReview, writingExercises = 0 }: StudentQuickActionsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ActionButton
        onClick={() => router.push('/dashboard/student/flashcards')}
        icon={<ActionButtonIcons.Document />}
        variant="purple"
      >
        <span className="md:hidden 2xl:inline">Practice Flashcards</span>
        <span className="hidden md:inline 2xl:hidden">Practice</span>
      </ActionButton>

      <ActionButton
        onClick={() => router.push('/dashboard/student/writing')}
        icon={<ActionButtonIcons.Message />}
        variant="cyan"
      >
        <span className="md:hidden 2xl:inline">Write Exercises</span>
        <span className="hidden md:inline 2xl:hidden">Write</span>
      </ActionButton>

      <ActionButton
        onClick={() => router.push('/dashboard/student/flashcard-review')}
        icon={<ActionButtonIcons.ArrowRight />}
        variant="mint"
      >
        <span className="md:hidden 2xl:inline">Review Cards</span>
        <span className="hidden md:inline 2xl:hidden">Review</span>
      </ActionButton>

      <ActionButton
        onClick={() => router.push('/dashboard/student/social')}
        icon={<ActionButtonIcons.Message />}
        variant="yellow"
      >
        <span className="md:hidden 2xl:inline">Social Feed</span>
        <span className="hidden md:inline 2xl:hidden">Social</span>
      </ActionButton>
    </div>
  );
}

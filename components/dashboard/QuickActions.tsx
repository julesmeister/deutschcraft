import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wide">
          Quick Actions
        </h5>
      </div>
      <div className="p-4 space-y-3">
        <ActionButton
          variant="purple"
          icon={<ActionButtonIcons.Analytics />}
          onClick={() => {}}
        >
          View Analytics
        </ActionButton>

        <ActionButton
          variant="cyan"
          icon={<ActionButtonIcons.Message />}
          onClick={() => {}}
        >
          Message Students
        </ActionButton>

        <ActionButton
          variant="mint"
          icon={<ActionButtonIcons.Document />}
          onClick={() => {}}
        >
          Create Assignment
        </ActionButton>

        <ActionButton
          variant="yellow"
          icon={<ActionButtonIcons.Document />}
          onClick={() => router.push('/dashboard/teacher/writing')}
        >
          Review Writing
        </ActionButton>

        <ActionButton
          variant="orange"
          icon={<ActionButtonIcons.Message />}
          onClick={() => router.push('/dashboard/teacher/social')}
        >
          Social Feed
        </ActionButton>
      </div>
    </div>
  );
}

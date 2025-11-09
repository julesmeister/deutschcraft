import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

export function QuickActions() {
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
          onClick={() => console.log('View Analytics clicked')}
        >
          View Analytics
        </ActionButton>

        <ActionButton
          variant="cyan"
          icon={<ActionButtonIcons.Message />}
          onClick={() => console.log('Message Students clicked')}
        >
          Message Students
        </ActionButton>

        <ActionButton
          variant="mint"
          icon={<ActionButtonIcons.Document />}
          onClick={() => console.log('Create Assignment clicked')}
        >
          Create Assignment
        </ActionButton>
      </div>
    </div>
  );
}

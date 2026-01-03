import { ActionButton, ActionButtonIcons } from "@/components/ui/ActionButton";

interface FreestyleSectionProps {
  onStart: () => void;
}

export function FreestyleSection({ onStart }: FreestyleSectionProps) {
  return (
    <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-200 text-center">
      <div className="text-4xl mb-4">✍️</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Freestyle Writing
      </h3>
      <p className="text-gray-600 mb-6 max-w-lg mx-auto">
        Write about any topic you like! You can choose to share your writing
        publicly or keep it private for teacher review only.
      </p>
      <div className="max-w-[200px] mx-auto">
        <ActionButton
          onClick={onStart}
          icon={<ActionButtonIcons.Play />}
          variant="purple"
        >
          Start Writing
        </ActionButton>
      </div>
    </div>
  );
}

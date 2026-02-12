import { Button } from "@/components/ui/Button";

interface PausedScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PausedScreen({ onResume, onRestart, onQuit }: PausedScreenProps) {
  return (
    <div className="max-w-md mx-auto text-center py-4 sm:py-8">
      <div className="bg-gray-800 rounded-2xl p-5 sm:p-8">
        <div className="text-5xl sm:text-6xl mb-4">⏸️</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">Paused</h2>

        <div className="space-y-3">
          <Button onClick={onResume} variant="primary" className="w-full">
            Resume
          </Button>
          <Button onClick={onRestart} variant="secondary" className="w-full">
            Restart
          </Button>
          <Button onClick={onQuit} variant="secondary" className="w-full !bg-gray-600 !text-white hover:!bg-gray-500">
            Quit
          </Button>
        </div>
      </div>
    </div>
  );
}

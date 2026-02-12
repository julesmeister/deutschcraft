import { Button } from "@/components/ui/Button";
import { VerbEntry, getPrefixColor } from "./data";
import { RootSelector } from "./RootSelector";

interface ReviewScreenProps {
  activeVerbData: VerbEntry[];
  allRoots: string[];
  selectedRoots: Set<string>;
  onToggleRoot: (root: string) => void;
  onClearRoots: () => void;
  onBack: () => void;
  onStart: () => void;
}

export function ReviewScreen({
  activeVerbData,
  allRoots,
  selectedRoots,
  onToggleRoot,
  onClearRoots,
  onBack,
  onStart,
}: ReviewScreenProps) {
  const grouped: Record<string, VerbEntry[]> = {};
  for (const v of activeVerbData) {
    if (!grouped[v.root]) grouped[v.root] = [];
    grouped[v.root].push(v);
  }

  return (
    <div className="py-4 sm:py-8 space-y-4">
      <div className="bg-gray-800 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white">Review Words</h2>
          <Button onClick={onBack} variant="secondary" size="sm">
            Back to Menu
          </Button>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
          {activeVerbData.length} verb combinations across {Object.keys(grouped).length} root words
        </p>

        <div className="columns-1 md:columns-2 xl:columns-3 gap-4 sm:gap-6">
          {Object.entries(grouped).map(([root, verbs]) => (
            <div key={root} className="break-inside-avoid mb-4 sm:mb-6">
              <h3 className="text-yellow-400 font-bold text-base sm:text-lg mb-2">{root}</h3>
              <div className="grid gap-1.5 sm:gap-2">
                {verbs.map(verb => (
                  <div key={verb.full} className="flex items-center justify-between bg-gray-700/50 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${getPrefixColor(verb.prefix)} bg-clip-text text-transparent`}>
                        {verb.prefix.replace('-', '')}
                      </span>
                      <span className="text-white font-semibold text-xs sm:text-sm">{verb.full}</span>
                    </div>
                    <span className="text-gray-400 text-xs ml-2 text-right">{verb.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RootSelector
        allRoots={allRoots}
        selectedRoots={selectedRoots}
        activeVerbData={activeVerbData}
        onToggleRoot={onToggleRoot}
        onClear={onClearRoots}
      />

      <Button onClick={onStart} variant="primary" className="w-full">
        Start Game
      </Button>
    </div>
  );
}

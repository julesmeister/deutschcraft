import { VERB_DATA, VerbEntry } from "./data";

interface RootSelectorProps {
  allRoots: string[];
  selectedRoots: Set<string>;
  activeVerbData: VerbEntry[];
  onToggleRoot: (root: string) => void;
  onClear: () => void;
}

export function RootSelector({
  allRoots,
  selectedRoots,
  activeVerbData,
  onToggleRoot,
  onClear,
}: RootSelectorProps) {
  return (
    <div className="bg-gray-800 rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-xs sm:text-sm">Practice Root Words</h3>
        {selectedRoots.size > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear ({selectedRoots.size})
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {allRoots.map(root => {
          const isSelected = selectedRoots.has(root);
          const count = VERB_DATA.filter(v => v.root === root).length;
          return (
            <button
              key={root}
              onClick={() => onToggleRoot(root)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-yellow-500 text-gray-900 ring-2 ring-yellow-300'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {root} <span className="opacity-60 text-xs">({count})</span>
            </button>
          );
        })}
      </div>
      <p className="text-gray-500 text-xs mt-2">
        {selectedRoots.size === 0
          ? `All ${VERB_DATA.length} combinations`
          : `${activeVerbData.length} combinations selected`}
      </p>
    </div>
  );
}

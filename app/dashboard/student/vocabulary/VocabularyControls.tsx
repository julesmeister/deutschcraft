import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import { CEFRLevel } from "@/lib/models/cefr";

interface VocabularyControlsProps {
  selectedLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Array<{ id: string; name: string }>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

export function VocabularyControls({
  selectedLevel,
  onLevelChange,
  selectedCategory,
  onCategoryChange,
  categories,
  searchQuery,
  onSearchChange,
  totalCount,
}: VocabularyControlsProps) {
  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h5 className="text-neutral-700 uppercase text-sm font-medium leading-snug">
            Vocabulary ({totalCount})
          </h5>
        </div>

        <div>
          <CEFRLevelSelector
            selectedLevel={selectedLevel}
            onLevelChange={onLevelChange}
            size="sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange("all")}
            className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
              selectedCategory === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.name)}
              className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                selectedCategory === cat.name
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search German or English..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-gray-50 border-none focus:outline-none focus:bg-gray-100 transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

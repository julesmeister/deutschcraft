"use client";

type MaterialType = "pdf" | "audio";

interface MaterialFiltersProps {
  materialType: MaterialType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedBookType: "All" | "KB" | "AB";
  setSelectedBookType: (type: "All" | "KB" | "AB") => void;
}

export function MaterialFilters({
  materialType,
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  selectedBookType,
  setSelectedBookType,
}: MaterialFiltersProps) {
  return (
    <div className="p-4 border-b border-gray-200 space-y-3">
      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={
          materialType === "pdf"
            ? "Search PDF materials..."
            : "Search audio files..."
        }
        className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-gray-700"
      />

      {/* Level Filter */}
      <div>
        <label className="block text-xs font-bold text-neutral-700 mb-2">
          Filter by Level
        </label>
        <div className="flex flex-wrap gap-2">
          {["All", "A1.1", "A1.2", "A2.1", "A2.2", "B1.1", "B1.2"].map(
            (level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  selectedLevel === level
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {level}
              </button>
            )
          )}
        </div>
      </div>

      {/* Book Type Filter (only for Audio) */}
      {materialType === "audio" && (
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-2">
            Filter by Book Type
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBookType("All")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                selectedBookType === "All"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedBookType("KB")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                selectedBookType === "KB"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              📖 Kursbuch
            </button>
            <button
              onClick={() => setSelectedBookType("AB")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                selectedBookType === "AB"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              📝 Arbeitsbuch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

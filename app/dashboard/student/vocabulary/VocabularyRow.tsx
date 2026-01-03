import { CEFRLevel } from "@/lib/models/cefr";

interface VocabularyEntry {
  id: string;
  german: string;
  english: string;
  category: string;
  level: CEFRLevel;
}

const ROW_COLOR_SCHEMES = [
  {
    bg: "hover:bg-blue-100",
    text: "group-hover:text-blue-900",
    badge: "group-hover:bg-blue-500",
  },
  {
    bg: "hover:bg-emerald-100",
    text: "group-hover:text-emerald-900",
    badge: "group-hover:bg-emerald-500",
  },
  {
    bg: "hover:bg-amber-100",
    text: "group-hover:text-amber-900",
    badge: "group-hover:bg-amber-500",
  },
  {
    bg: "hover:bg-purple-100",
    text: "group-hover:text-purple-900",
    badge: "group-hover:bg-purple-500",
  },
  {
    bg: "hover:bg-pink-100",
    text: "group-hover:text-pink-900",
    badge: "group-hover:bg-pink-500",
  },
  {
    bg: "hover:bg-indigo-100",
    text: "group-hover:text-indigo-900",
    badge: "group-hover:bg-indigo-500",
  },
];

interface VocabularyRowProps {
  entry: VocabularyEntry;
  colorIndex: number;
}

export function VocabularyRow({ entry, colorIndex }: VocabularyRowProps) {
  const colorScheme = ROW_COLOR_SCHEMES[colorIndex % ROW_COLOR_SCHEMES.length];

  return (
    <div
      className={`group ${colorScheme.bg} px-6 py-3 transition-all duration-200 cursor-pointer`}
    >
      <div className="grid grid-cols-[200px,1fr,auto] gap-16 items-center">
        <div className="min-w-0">
          <span
            className={`text-base font-bold text-gray-900 ${colorScheme.text} transition-colors duration-200`}
          >
            {entry.german}
          </span>
        </div>

        <div className="min-w-0">
          <span
            className={`text-sm text-gray-600 ${colorScheme.text} transition-colors duration-200`}
          >
            {entry.english}
          </span>
        </div>

        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 ${colorScheme.badge} group-hover:text-white transition-all duration-200`}
          >
            {entry.category}
          </span>
        </div>
      </div>
    </div>
  );
}

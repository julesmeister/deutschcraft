import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string;
  cardCount: number;
}

interface CategoryButtonGridProps {
  categories: Category[];
  onSelect: (categoryId: string, categoryName: string) => void;
  categoryCompletionStatus?: Map<string, 'not-started' | 'in-progress' | 'completed'>;
  categoryAttemptCounts?: Map<string, number>;
  categoryDueCounts?: Map<string, number>;
  className?: string;
}

// Color scheme definitions - Flatter, more muted colors (copied from CEFRLevelSelector)
const COLOR_SCHEME = [
  { bg: 'bg-slate-200', icon: 'bg-slate-600', text: 'text-slate-800', hover: 'hover:bg-slate-300', border: 'border-slate-300' },
  { bg: 'bg-orange-200', icon: 'bg-orange-600', text: 'text-orange-800', hover: 'hover:bg-orange-300', border: 'border-orange-300' },
  { bg: 'bg-cyan-200', icon: 'bg-cyan-600', text: 'text-cyan-800', hover: 'hover:bg-cyan-300', border: 'border-cyan-300' },
  { bg: 'bg-fuchsia-200', icon: 'bg-fuchsia-600', text: 'text-fuchsia-800', hover: 'hover:bg-fuchsia-300', border: 'border-fuchsia-300' },
  { bg: 'bg-emerald-200', icon: 'bg-emerald-600', text: 'text-emerald-800', hover: 'hover:bg-emerald-300', border: 'border-emerald-300' },
  { bg: 'bg-rose-200', icon: 'bg-rose-600', text: 'text-rose-800', hover: 'hover:bg-rose-300', border: 'border-rose-300' },
  { bg: 'bg-violet-200', icon: 'bg-violet-600', text: 'text-violet-800', hover: 'hover:bg-violet-300', border: 'border-violet-300' },
  { bg: 'bg-amber-200', icon: 'bg-amber-600', text: 'text-amber-800', hover: 'hover:bg-amber-300', border: 'border-amber-300' },
  { bg: 'bg-sky-200', icon: 'bg-sky-600', text: 'text-sky-800', hover: 'hover:bg-sky-300', border: 'border-sky-300' },
  { bg: 'bg-lime-200', icon: 'bg-lime-600', text: 'text-lime-800', hover: 'hover:bg-lime-300', border: 'border-lime-300' },
];

export function CategoryButtonGrid({
  categories,
  onSelect,
  categoryCompletionStatus,
  categoryAttemptCounts,
  categoryDueCounts,
  className,
}: CategoryButtonGridProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3", className)}>
      {categories.map((category, index) => {
        // Cycle through color schemes
        const colorSet = COLOR_SCHEME[index % COLOR_SCHEME.length];
        
        const completionStatus = categoryCompletionStatus?.get(category.id);
        const dueCount = categoryDueCounts?.get(category.id) || 0;
        const attempts = categoryAttemptCounts?.get(category.id) || 0;
        
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id, category.name)}
            className={cn(
              "relative flex flex-col items-start justify-between p-4 rounded-xl transition-all duration-200 active:scale-95 text-left h-full min-h-[120px]",
              colorSet.bg,
              colorSet.text,
              colorSet.hover,
              "border-b-4",
              colorSet.border
            )}
          >
            {/* Top Row: Icon and Due Badge */}
            <div className="flex w-full justify-between items-start mb-2">
              <span className="text-3xl filter drop-shadow-sm">{category.icon}</span>
              {dueCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {dueCount} due
                </span>
              )}
            </div>
            
            {/* Bottom Row: Name and Stats */}
            <div className="w-full mb-3">
              <h3 className="font-black text-lg leading-tight mb-1">{category.name}</h3>
              <div className="flex items-center justify-between text-xs opacity-75 font-medium">
                <span>{category.cardCount} cards</span>
                {completionStatus === 'completed' && (
                  <span className="flex items-center gap-1">
                    ✓ Done
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress Bar (if started) */}
            {attempts > 0 && completionStatus !== 'completed' && (
              <div className="absolute bottom-3 left-4 right-4 h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black/20 rounded-full" 
                  style={{ width: `${Math.min((attempts / category.cardCount) * 100, 100)}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

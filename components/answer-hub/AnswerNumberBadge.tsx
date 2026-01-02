
"use client";

interface AnswerNumberBadgeProps {
  itemNumber: string;
}

export function AnswerNumberBadge({ itemNumber }: AnswerNumberBadgeProps) {
  const isNumericItem = /^[0-9.]+$/.test(itemNumber);

  return (
    <div className={`flex-shrink-0 pt-0.5 ${isNumericItem ? "min-w-8" : "mr-1"}`}>
      {isNumericItem ? (
        <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-xs font-bold text-gray-600 border border-gray-200 shadow-sm">
          {itemNumber}
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
          {itemNumber}
        </span>
      )}
    </div>
  );
}

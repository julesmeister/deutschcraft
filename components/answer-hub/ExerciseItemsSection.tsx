import { ExerciseAnswer } from "@/lib/models/exercises";

interface ExerciseItemsSectionProps {
  answers: ExerciseAnswer[];
  isCollapsed: boolean;
  onToggle: () => void;
}

export function ExerciseItemsSection({
  answers,
  isCollapsed,
  onToggle,
}: ExerciseItemsSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors duration-200 mb-2"
      >
        <span className="text-sm font-semibold">
          {isCollapsed ? "Show Exercise Items" : "Hide Exercise Items"} (
          {answers.length} item{answers.length !== 1 ? "s" : ""})
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isCollapsed ? "" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-800 mb-2">
                <span className="font-semibold">
                  Exercise has {answers.length} item
                  {answers.length !== 1 ? "s" : ""}:
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {answers.map((answer, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                  >
                    Item {answer.itemNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

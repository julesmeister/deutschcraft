import { Edit3, Sparkles, EyeOff, Files } from "lucide-react";
import { ExerciseWithOverrideMetadata } from "@/lib/models/exerciseOverride";
import { Exercise } from "@/lib/models/exercises";

interface ExerciseStatusBadgeProps {
  exercise: Exercise | ExerciseWithOverrideMetadata;
  variant?: "default" | "list";
  showHidden?: boolean;
  showDuplicate?: boolean;
  isDuplicate?: boolean;
}

export function ExerciseStatusBadge({
  exercise,
  variant = "default",
  showHidden = true,
  showDuplicate = true,
  isDuplicate = false,
}: ExerciseStatusBadgeProps) {
  // Helper to check if property exists safely
  const isCreated = "_isCreated" in exercise && exercise._isCreated;
  const isModified = "_isModified" in exercise && exercise._isModified;
  const isHidden = "_isHidden" in exercise && exercise._isHidden;

  // Common classes
  const baseClasses = "inline-flex items-center gap-1 font-semibold";
  const defaultSizeClasses = "px-2.5 py-0.5 rounded-full text-xs border";
  const listSizeClasses = "px-3 py-1 text-xs font-bold";

  // Determine size classes based on variant
  const sizeClasses = variant === "list" ? listSizeClasses : defaultSizeClasses;

  return (
    <>
      {isCreated ? (
        <span
          className={`${baseClasses} ${sizeClasses} ${
            variant === "list"
              ? "bg-green-100 text-green-800"
              : "bg-green-100 text-green-800 border-green-300"
          }`}
        >
          {variant === "default" && <Sparkles className="w-3 h-3" />}
          {variant === "list" ? "CUSTOM" : "Custom"}
        </span>
      ) : isModified ? (
        <span
          className={`${baseClasses} ${sizeClasses} ${
            variant === "list"
              ? "bg-pink-100 text-pink-800"
              : "bg-pink-100 text-pink-800 border-pink-300"
          }`}
        >
          {variant === "default" && <Edit3 className="w-3 h-3" />}
          {variant === "list" ? "MODIFIED" : "Modified"}
        </span>
      ) : null}

      {showHidden && isHidden && (
        <span
          className={`${baseClasses} ${sizeClasses} ${
            variant === "list"
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-100 text-gray-600 border-gray-300"
          }`}
        >
          {variant === "default" && <EyeOff className="w-3 h-3" />}
          {variant === "list" ? "HIDDEN" : "Hidden"}
        </span>
      )}

      {showDuplicate && isDuplicate && (
        <span
          className={`${baseClasses} ${sizeClasses} ${
            variant === "list"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }`}
        >
          {variant === "default" && <Files className="w-3 h-3" />}
          {variant === "list" ? "DUPLICATE" : "Duplicate"}
        </span>
      )}
    </>
  );
}

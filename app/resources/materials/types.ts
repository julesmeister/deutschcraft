/**
 * Types for Materials Page
 */

export type FilterLevel =
  | "All"
  | "A1.1"
  | "A1.2"
  | "A2.1"
  | "A2.2"
  | "B1.1"
  | "B1.2"
  | "General";

export type FilterCategory =
  | "All"
  | "Textbook"
  | "Teaching Plan"
  | "Copy Template"
  | "Test"
  | "Solutions"
  | "Transcripts"
  | "Extra Materials";

export type MaterialType = "pdf" | "audio";

export const LEVEL_OPTIONS: FilterLevel[] = [
  "All",
  "A1.1",
  "A1.2",
  "A2.1",
  "A2.2",
  "B1.1",
  "B1.2",
];

export const CATEGORY_OPTIONS: FilterCategory[] = [
  "All",
  "Textbook",
  "Teaching Plan",
  "Copy Template",
  "Test",
  "Solutions",
  "Transcripts",
  "Extra Materials",
];

export function getCategoryIcon(category: string): string {
  switch (category) {
    case "Textbook":
      return "📚";
    case "Teaching Plan":
      return "📝";
    case "Copy Template":
      return "📋";
    case "Test":
      return "📊";
    case "Solutions":
      return "✅";
    case "Transcripts":
      return "🎧";
    case "Extra Materials":
      return "📁";
    default:
      return "📄";
  }
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

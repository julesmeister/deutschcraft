import { Exercise } from "@/lib/models/exercises";

export const DIFFICULTY_COLORS = {
  easy: "bg-emerald-100 text-emerald-800 border-emerald-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  hard: "bg-red-100 text-red-800 border-red-300",
};

export const BOOK_TYPE_COLORS = {
  AB: "bg-blue-100 text-blue-800 border-blue-300",
  KB: "bg-purple-100 text-purple-800 border-purple-300",
};

export function getDifficultyColor(difficulty?: 'easy' | 'medium' | 'hard') {
  return difficulty ? DIFFICULTY_COLORS[difficulty] : DIFFICULTY_COLORS.easy;
}

export function getBookTypeColor(bookType: 'AB' | 'KB') {
  return BOOK_TYPE_COLORS[bookType] || BOOK_TYPE_COLORS.AB;
}

export function getTimeAgo(timestamp?: number): string {
  if (!timestamp) return "";

  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

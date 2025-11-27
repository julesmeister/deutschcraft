/**
 * DiffText Component
 * Displays text with highlighted changes (additions, deletions, unchanged)
 */

'use client';

import { getDiff, DiffPart } from '@/lib/utils/textDiff';

interface DiffTextProps {
  originalText: string;
  correctedText: string;
  className?: string;
}

export function DiffText({ originalText, correctedText, className = '' }: DiffTextProps) {
  const diffParts = getDiff(originalText, correctedText);

  return (
    <div className={`leading-relaxed whitespace-pre-wrap ${className}`}
      style={{
        lineHeight: '1.6',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
      {diffParts.map((part, index) => {
        if (part.type === 'added') {
          return (
            <span
              key={index}
              className="bg-yellow-50 text-gray-900 rounded px-0.5"
            >
              {part.value}
            </span>
          );
        } else if (part.type === 'removed') {
          return (
            <span
              key={index}
              className="bg-red-50 text-gray-600 line-through opacity-60 rounded px-0.5"
            >
              {part.value}
            </span>
          );
        } else {
          return (
            <span key={index} className="text-gray-900">
              {part.value}
            </span>
          );
        }
      })}
    </div>
  );
}

/**
 * Show only the corrected version with highlights (no strikethrough)
 * Good for final corrected versions
 */
export function DiffTextCorrectedOnly({ originalText, correctedText, className = '' }: DiffTextProps) {
  const diffParts = getDiff(originalText, correctedText);

  return (
    <div className={`leading-relaxed whitespace-pre-wrap ${className}`}
      style={{
        lineHeight: '1.6',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
      {diffParts.map((part, index) => {
        if (part.type === 'added') {
          return (
            <span
              key={index}
              className="bg-yellow-100 text-gray-900 rounded px-0.5"
              title="Added/corrected"
            >
              {part.value}
            </span>
          );
        } else if (part.type === 'removed') {
          // Skip removed parts in corrected-only view
          return null;
        } else {
          return (
            <span key={index} className="text-gray-700">
              {part.value}
            </span>
          );
        }
      })}
    </div>
  );
}

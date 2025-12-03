'use client';

import { useState, useEffect } from 'react';
import { Suggestion } from '@/lib/models/social';
import SuggestionTooltip from './SuggestionTooltip';

interface SuggestionHighlightProps {
  content: string;
  postId: string;
  showHighlights: boolean;
}

export default function SuggestionHighlight({
  content,
  postId,
  showHighlights
}: SuggestionHighlightProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    if (showHighlights) {
      // Fetch suggestions for this post
      fetchSuggestions();
    }
  }, [postId, showHighlights]);

  const fetchSuggestions = async () => {
    // TODO: Implement Firestore query
    // For now, mock data
    const mockSuggestions: Suggestion[] = [];
    setSuggestions(mockSuggestions);
  };

  const renderHighlightedText = () => {
    if (!showHighlights || suggestions.length === 0) {
      return <>{content}</>;
    }

    // Sort suggestions by position
    const sortedSuggestions = [...suggestions].sort((a, b) => {
      const aStart = a.position?.start || 0;
      const bStart = b.position?.start || 0;
      return aStart - bStart;
    });

    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    sortedSuggestions.forEach((suggestion, index) => {
      if (!suggestion.position) return;

      const { start, end } = suggestion.position;

      // Add text before the suggestion
      if (start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>{content.substring(lastIndex, start)}</span>
        );
      }

      // Add highlighted suggestion
      const highlightClass = getHighlightClass(suggestion);
      parts.push(
        <span
          key={`suggestion-${index}`}
          className={`suggestion-highlight ${highlightClass}`}
          onClick={() => setSelectedSuggestion(suggestion)}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          {content.substring(start, end)}
          {suggestion.status === 'pending' && (
            <span className="suggestion-indicator">?</span>
          )}
        </span>
      );

      lastIndex = end;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end">{content.substring(lastIndex)}</span>
      );
    }

    return <>{parts}</>;
  };

  const getHighlightClass = (suggestion: Suggestion): string => {
    const baseClass = 'border-bottom border-2';

    switch (suggestion.type) {
      case 'grammar':
        return `${baseClass} border-warning text-warning`;
      case 'vocabulary':
        return `${baseClass} border-info text-info`;
      case 'spelling':
        return `${baseClass} border-danger text-danger`;
      case 'style':
        return `${baseClass} border-primary text-primary`;
      default:
        return `${baseClass} border-secondary text-secondary`;
    }
  };

  return (
    <span className="relative inline">
      {renderHighlightedText()}

      {/* Suggestion Tooltip */}
      {selectedSuggestion && (
        <SuggestionTooltip
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          onAccept={() => {
            // Handle accept
            setSelectedSuggestion(null);
          }}
          onReject={() => {
            // Handle reject
            setSelectedSuggestion(null);
          }}
        />
      )}

      <style jsx>{`
        .suggestion-highlight {
          border-bottom-style: wavy;
          padding-bottom: 2px;
          transition: all 0.2s;
        }

        .suggestion-highlight:hover {
          background-color: rgba(255, 193, 7, 0.1);
        }

        .suggestion-indicator {
          font-size: 0.7em;
          vertical-align: super;
          margin-left: 2px;
        }
      `}</style>
    </span>
  );
}

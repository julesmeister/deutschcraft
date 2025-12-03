'use client';

import { useState, useEffect } from 'react';
import { Suggestion } from '@/lib/models/social';

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

interface SuggestionTooltipProps {
  suggestion: Suggestion;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}

function SuggestionTooltip({
  suggestion,
  onClose,
  onAccept,
  onReject
}: SuggestionTooltipProps) {
  return (
    <div className="suggestion-tooltip card shadow-lg position-absolute" style={{ zIndex: 1000, maxWidth: '400px' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className={`badge bg-${getTypeColor(suggestion.type)}`}>
            {suggestion.type}
          </span>
          <button
            className="btn-close btn-sm"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        <div className="mb-3">
          <div className="mb-2">
            <small className="text-muted">Original:</small>
            <div className="bg-light p-2 rounded">
              <s>{suggestion.originalText}</s>
            </div>
          </div>
          <div>
            <small className="text-muted">Suggested:</small>
            <div className="bg-success bg-opacity-10 p-2 rounded text-success">
              {suggestion.suggestedText}
            </div>
          </div>
        </div>

        {suggestion.explanation && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Explanation:</small>
            <p className="small mb-0">{suggestion.explanation}</p>
          </div>
        )}

        {suggestion.grammarRule && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Grammar Rule:</small>
            <p className="small mb-0">{suggestion.grammarRule}</p>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {suggestion.upvotes} upvotes
          </small>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-danger" onClick={onReject}>
              Reject
            </button>
            <button className="btn btn-success" onClick={onAccept}>
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'grammar':
      return 'warning';
    case 'vocabulary':
      return 'info';
    case 'spelling':
      return 'danger';
    case 'style':
      return 'primary';
    default:
      return 'secondary';
  }
}

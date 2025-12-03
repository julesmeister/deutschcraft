'use client';

import { Suggestion } from '@/lib/models/social';

interface SuggestionTooltipProps {
  suggestion: Suggestion;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export default function SuggestionTooltip({
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

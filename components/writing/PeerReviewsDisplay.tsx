/**
 * PeerReviewsDisplay Component
 * Displays all peer reviews for a submission
 */

import { ActivityCard } from '@/components/ui/activity/ActivityCard';
import { PeerReview } from '@/lib/models/writing';

interface PeerReviewsDisplayProps {
  peerReviews: PeerReview[];
}

export function PeerReviewsDisplay({ peerReviews }: PeerReviewsDisplayProps) {
  if (peerReviews.length === 0) {
    return (
      <ActivityCard title="No Peer Reviews Yet">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Reviews Yet</h3>
          <p className="text-neutral-600">
            Your classmates haven't reviewed your work yet. Check back later!
          </p>
        </div>
      </ActivityCard>
    );
  }

  return (
    <div className="space-y-4">
      {peerReviews.map((review) => (
        <ActivityCard
          key={review.reviewId}
          title={`Review by ${review.reviewerId}`}
          subtitle={new Date(review.createdAt).toLocaleDateString()}
        >
          {/* Star Ratings */}
          {(review.grammarRating || review.vocabularyRating || review.creativityRating) && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              {review.grammarRating && (
                <RatingDisplay label="Grammar" rating={review.grammarRating} />
              )}
              {review.vocabularyRating && (
                <RatingDisplay label="Vocabulary" rating={review.vocabularyRating} />
              )}
              {review.creativityRating && (
                <RatingDisplay label="Creativity" rating={review.creativityRating} />
              )}
            </div>
          )}

          {/* Overall Comment */}
          <div className="mb-4">
            <div className="text-sm font-semibold text-neutral-700 mb-1">Overall Comment</div>
            <p className="text-neutral-700">{review.overallComment}</p>
          </div>

          {/* Strengths */}
          {review.strengths && review.strengths.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-neutral-700 mb-2">Strengths</div>
              <ul className="space-y-1">
                {review.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-neutral-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {review.improvements && review.improvements.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-neutral-700 mb-2">Suggestions for Improvement</div>
              <ul className="space-y-1">
                {review.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500">→</span>
                    <span className="text-neutral-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ActivityCard>
      ))}
    </div>
  );
}

// Helper component for star ratings
interface RatingDisplayProps {
  label: string;
  rating: number;
}

function RatingDisplay({ label, rating }: RatingDisplayProps) {
  return (
    <div>
      <div className="text-xs text-neutral-500 uppercase font-semibold">{label}</div>
      <div className="flex items-center gap-1 mt-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}

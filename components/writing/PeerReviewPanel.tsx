/**
 * PeerReviewPanel Component
 * Interface for students to review each other's writing
 */

import { useState } from 'react';
import { PeerReview, TextChange } from '@/lib/models/writing';
import { ActivityCard } from '@/components/ui/activity/ActivityCard';

interface PeerReviewPanelProps {
  submissionId: string;
  submissionContent: string;
  onSubmitReview: (review: Omit<PeerReview, 'reviewId' | 'createdAt' | 'submittedAt'>) => void;
  existingReview?: PeerReview;
  reviewerId: string;
  revieweeId: string;
}

export function PeerReviewPanel({
  submissionId,
  submissionContent,
  onSubmitReview,
  existingReview,
  reviewerId,
  revieweeId,
}: PeerReviewPanelProps) {
  const [overallComment, setOverallComment] = useState(existingReview?.overallComment || '');
  const [strengths, setStrengths] = useState<string[]>(existingReview?.strengths || ['', '', '']);
  const [improvements, setImprovements] = useState<string[]>(existingReview?.improvements || ['', '', '']);
  const [grammarRating, setGrammarRating] = useState(existingReview?.grammarRating || 0);
  const [vocabularyRating, setVocabularyRating] = useState(existingReview?.vocabularyRating || 0);
  const [creativityRating, setCreativityRating] = useState(existingReview?.creativityRating || 0);

  const handleSubmit = () => {
    const review: Omit<PeerReview, 'reviewId' | 'createdAt' | 'submittedAt'> = {
      submissionId,
      reviewerId,
      revieweeId,
      overallComment,
      strengths: strengths.filter(s => s.trim() !== ''),
      improvements: improvements.filter(i => i.trim() !== ''),
      suggestedEdits: [], // TODO: Implement inline editing
      grammarRating: grammarRating || undefined,
      vocabularyRating: vocabularyRating || undefined,
      creativityRating: creativityRating || undefined,
      status: 'submitted',
      acknowledgedAt: undefined,
    };

    onSubmitReview(review);
  };

  return (
    <div className="space-y-6">
      {/* Overall Comment */}
      <ActivityCard title="Overall Feedback">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            General comments about the writing:
          </label>
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="What did you think about your classmate's writing overall?"
            className="w-full h-32 p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </ActivityCard>

      {/* Ratings */}
      <ActivityCard title="Ratings">
        <div className="space-y-4">
          <StarRating
            label="Grammar & Accuracy"
            rating={grammarRating}
            onChange={setGrammarRating}
          />
          <StarRating
            label="Vocabulary Usage"
            rating={vocabularyRating}
            onChange={setVocabularyRating}
          />
          <StarRating
            label="Creativity & Ideas"
            rating={creativityRating}
            onChange={setCreativityRating}
          />
        </div>
      </ActivityCard>

      {/* Strengths */}
      <ActivityCard title="Strengths" subtitle="What did your classmate do well?">
        <div className="space-y-3">
          {strengths.map((strength, idx) => (
            <div key={idx}>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Strength {idx + 1}
              </label>
              <input
                type="text"
                value={strength}
                onChange={(e) => {
                  const newStrengths = [...strengths];
                  newStrengths[idx] = e.target.value;
                  setStrengths(newStrengths);
                }}
                placeholder="e.g., Good use of descriptive adjectives"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          ))}
        </div>
      </ActivityCard>

      {/* Areas for Improvement */}
      <ActivityCard title="Areas for Improvement" subtitle="Suggestions to help your classmate improve">
        <div className="space-y-3">
          {improvements.map((improvement, idx) => (
            <div key={idx}>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Suggestion {idx + 1}
              </label>
              <input
                type="text"
                value={improvement}
                onChange={(e) => {
                  const newImprovements = [...improvements];
                  newImprovements[idx] = e.target.value;
                  setImprovements(newImprovements);
                }}
                placeholder="e.g., Try using more varied sentence structures"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          ))}
        </div>
      </ActivityCard>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setOverallComment('');
            setStrengths(['', '', '']);
            setImprovements(['', '', '']);
            setGrammarRating(0);
            setVocabularyRating(0);
            setCreativityRating(0);
          }}
          className="px-5 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!overallComment.trim()}
          className="px-6 py-2 text-sm font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}

interface StarRatingProps {
  label: string;
  rating: number;
  onChange: (rating: number) => void;
}

function StarRating({ label, rating, onChange }: StarRatingProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`text-2xl transition-all ${
              star <= rating ? 'text-amber-500' : 'text-neutral-300'
            } hover:scale-110`}
          >
            ⭐
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-neutral-600 self-center">
            {rating} / 5
          </span>
        )}
      </div>
    </div>
  );
}

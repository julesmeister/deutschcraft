/**
 * TeacherGradingPanel Component
 * Interface for teachers to grade student writing submissions
 */

import { useState } from 'react';
import { TeacherReview, TextChange } from '@/lib/models/writing';
import { ActivityCard } from '@/components/ui/activity/ActivityCard';

interface TeacherGradingPanelProps {
  submissionId: string;
  submissionContent: string;
  studentId: string;
  teacherId: string;
  onSubmitReview: (review: Omit<TeacherReview, 'reviewId' | 'createdAt' | 'updatedAt'>) => void;
  existingReview?: TeacherReview;
}

export function TeacherGradingPanel({
  submissionId,
  submissionContent,
  studentId,
  teacherId,
  onSubmitReview,
  existingReview,
}: TeacherGradingPanelProps) {
  const [overallComment, setOverallComment] = useState(existingReview?.overallComment || '');
  const [strengths, setStrengths] = useState<string[]>(existingReview?.strengths || ['', '', '']);
  const [areasForImprovement, setAreasForImprovement] = useState<string[]>(
    existingReview?.areasForImprovement || ['', '', '']
  );
  const [grammarScore, setGrammarScore] = useState(existingReview?.grammarScore || 0);
  const [vocabularyScore, setVocabularyScore] = useState(existingReview?.vocabularyScore || 0);
  const [coherenceScore, setCoherenceScore] = useState(existingReview?.coherenceScore || 0);
  const [meetsCriteria, setMeetsCriteria] = useState(existingReview?.meetsCriteria || false);
  const [requiresRevision, setRequiresRevision] = useState(existingReview?.requiresRevision || false);
  const [revisionInstructions, setRevisionInstructions] = useState(existingReview?.revisionInstructions || '');

  // Calculate overall score from individual scores
  const overallScore = Math.round((grammarScore + vocabularyScore + coherenceScore) / 3);

  const handleSubmit = () => {
    const review: Omit<TeacherReview, 'reviewId' | 'createdAt' | 'updatedAt'> = {
      submissionId,
      teacherId,
      studentId,
      overallComment,
      strengths: strengths.filter(s => s.trim() !== ''),
      areasForImprovement: areasForImprovement.filter(a => a.trim() !== ''),
      suggestedEdits: [], // TODO: Implement inline editing
      grammarScore,
      vocabularyScore,
      coherenceScore,
      overallScore,
      meetsCriteria,
      requiresRevision,
      revisionInstructions: requiresRevision ? revisionInstructions : undefined,
    };

    onSubmitReview(review);
  };

  return (
    <div className="space-y-6">
      {/* Scores Grid */}
      <ActivityCard title="Grading Scores">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreSlider
            label="Grammar & Accuracy"
            score={grammarScore}
            onChange={setGrammarScore}
            color="emerald"
          />
          <ScoreSlider
            label="Vocabulary Usage"
            score={vocabularyScore}
            onChange={setVocabularyScore}
            color="purple"
          />
          <ScoreSlider
            label="Coherence & Structure"
            score={coherenceScore}
            onChange={setCoherenceScore}
            color="amber"
          />
        </div>

        {/* Overall Score Display */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-700">Overall Score</span>
            <div className="text-4xl font-black text-blue-600">{overallScore}%</div>
          </div>
        </div>
      </ActivityCard>

      {/* Overall Feedback */}
      <ActivityCard title="Overall Feedback">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            General comments about the student's writing:
          </label>
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="Provide constructive feedback about the student's overall performance..."
            className="w-full h-32 p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </ActivityCard>

      {/* Strengths */}
      <ActivityCard title="Strengths" subtitle="What did the student do well?">
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
                placeholder="e.g., Excellent use of past tense conjugations"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          ))}
        </div>
      </ActivityCard>

      {/* Areas for Improvement */}
      <ActivityCard title="Areas for Improvement" subtitle="Constructive suggestions">
        <div className="space-y-3">
          {areasForImprovement.map((area, idx) => (
            <div key={idx}>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Improvement Area {idx + 1}
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => {
                  const newAreas = [...areasForImprovement];
                  newAreas[idx] = e.target.value;
                  setAreasForImprovement(newAreas);
                }}
                placeholder="e.g., Practice using more complex sentence structures"
                className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          ))}
        </div>
      </ActivityCard>

      {/* Assessment Criteria */}
      <ActivityCard title="Assessment">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={meetsCriteria}
              onChange={(e) => setMeetsCriteria(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <div className="font-semibold text-neutral-900">Meets Exercise Criteria</div>
              <div className="text-sm text-neutral-600">
                Student fulfilled all requirements of the exercise
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresRevision}
              onChange={(e) => setRequiresRevision(e.target.checked)}
              className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
            />
            <div>
              <div className="font-semibold text-neutral-900">Requires Revision</div>
              <div className="text-sm text-neutral-600">
                Student should revise and resubmit this work
              </div>
            </div>
          </label>

          {requiresRevision && (
            <div className="ml-8 mt-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Revision Instructions
              </label>
              <textarea
                value={revisionInstructions}
                onChange={(e) => setRevisionInstructions(e.target.value)}
                placeholder="Explain what the student should focus on when revising..."
                className="w-full h-24 p-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm"
              />
            </div>
          )}
        </div>
      </ActivityCard>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setOverallComment('');
            setStrengths(['', '', '']);
            setAreasForImprovement(['', '', '']);
            setGrammarScore(0);
            setVocabularyScore(0);
            setCoherenceScore(0);
            setMeetsCriteria(false);
            setRequiresRevision(false);
            setRevisionInstructions('');
          }}
          className="px-5 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!overallComment.trim() || grammarScore === 0}
          className="px-6 py-2 text-sm font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}

interface ScoreSliderProps {
  label: string;
  score: number;
  onChange: (score: number) => void;
  color: 'emerald' | 'purple' | 'amber';
}

function ScoreSlider({ label, score, onChange, color }: ScoreSliderProps) {
  const colorClasses = {
    emerald: 'text-emerald-600 accent-emerald-600',
    purple: 'text-purple-600 accent-purple-600',
    amber: 'text-amber-600 accent-amber-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-neutral-700">{label}</label>
        <span className={`text-2xl font-black ${colorClasses[color]}`}>
          {score}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={score}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colorClasses[color]}`}
        style={{
          background: `linear-gradient(to right,
            currentColor 0%,
            currentColor ${score}%,
            #e5e7eb ${score}%,
            #e5e7eb 100%)`
        }}
      />
      <div className="flex justify-between mt-1 text-xs text-neutral-400">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

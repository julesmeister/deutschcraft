/**
 * TeacherGradingPanel Component
 * Interface for teachers to grade student writing submissions
 */

import { useState } from 'react';
import { TeacherReview } from '@/lib/models/writing';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';
import { GradingInput } from './grading/GradingInput';
import { GradingTextarea } from './grading/GradingTextarea';
import { GradingSection } from './grading/GradingSection';
import { ScoreSlider } from './grading/ScoreSlider';
import { AssessmentCheckbox } from './grading/AssessmentCheckbox';

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
    <div className="space-y-8">
      {/* Scores Section */}
      <GradingSection title="Grading Scores">
        <div className="space-y-6">
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
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Overall Score</span>
            <div className="text-3xl font-bold text-blue-600">{overallScore}%</div>
          </div>
        </div>
      </GradingSection>

      {/* Overall Feedback */}
      <GradingSection title="Overall Feedback">
        <GradingTextarea
          value={overallComment}
          onChange={setOverallComment}
          placeholder="Provide constructive feedback about the student's overall performance..."
          rows={6}
        />
      </GradingSection>

      {/* Strengths */}
      <GradingSection title="Strengths" subtitle="What did the student do well?">
        <div className="space-y-2">
          {strengths.map((strength, idx) => (
            <GradingInput
              key={idx}
              value={strength}
              onChange={(value) => {
                const newStrengths = [...strengths];
                newStrengths[idx] = value;
                setStrengths(newStrengths);
              }}
              placeholder={`Strength ${idx + 1}: e.g., Excellent use of past tense`}
            />
          ))}
        </div>
      </GradingSection>

      {/* Areas for Improvement */}
      <GradingSection title="Areas for Improvement" subtitle="Constructive suggestions">
        <div className="space-y-2">
          {areasForImprovement.map((area, idx) => (
            <GradingInput
              key={idx}
              value={area}
              onChange={(value) => {
                const newAreas = [...areasForImprovement];
                newAreas[idx] = value;
                setAreasForImprovement(newAreas);
              }}
              placeholder={`Area ${idx + 1}: e.g., Practice complex sentence structures`}
            />
          ))}
        </div>
      </GradingSection>

      {/* Assessment Criteria */}
      <GradingSection title="Assessment">
        <div className="space-y-3">
          <AssessmentCheckbox
            checked={meetsCriteria}
            onChange={setMeetsCriteria}
            label="Meets Exercise Criteria"
            description="Student fulfilled all requirements"
            color="blue"
          />

          <AssessmentCheckbox
            checked={requiresRevision}
            onChange={setRequiresRevision}
            label="Requires Revision"
            description="Student should revise and resubmit"
            color="amber"
          />

          {requiresRevision && (
            <div className="ml-7 mt-2">
              <GradingTextarea
                value={revisionInstructions}
                onChange={setRevisionInstructions}
                placeholder="Explain what the student should focus on when revising..."
                rows={3}
              />
            </div>
          )}
        </div>
      </GradingSection>

      {/* Submit Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
        <ActionButton
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
          icon={<ActionButtonIcons.X />}
          variant="yellow"
        >
          Clear Form
        </ActionButton>
        <ActionButton
          onClick={handleSubmit}
          disabled={!overallComment.trim() || grammarScore === 0}
          icon={<ActionButtonIcons.Check />}
          variant="purple"
        >
          {existingReview ? 'Update Review' : 'Submit Review'}
        </ActionButton>
      </div>
    </div>
  );
}

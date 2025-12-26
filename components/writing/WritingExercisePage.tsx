/**
 * WritingExercisePage - Reusable wrapper for all writing exercise types
 * Handles common logic: level filtering, exercise selection, save/submit, navigation
 */

'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { useToast } from '@/components/ui/toast';
import { FloatingRedemittelWidget } from '@/components/writing/FloatingRedemittelWidget';

interface WritingExercisePageProps<T> {
  // Page configuration
  title: string; // e.g., "Translation Practice 🔄"
  subtitle: string; // e.g., "Translate English to German"

  // Data
  allExercises: T[];
  getExerciseLevel: (exercise: T) => CEFRLevel;
  getExerciseTitle: (exercise: T) => string;
  getExerciseDifficulty?: (exercise: T) => string;

  // Components
  renderExerciseInfo: (exercise: T) => ReactNode;
  renderWorkspace: (exercise: T, content: string, onChange: (content: string) => void, wordCount?: number) => ReactNode;
  renderSelector: (exercises: T[], onSelect: (exercise: T) => void) => ReactNode;

  // Validation (optional)
  validateSubmit?: (exercise: T, content: string, wordCount: number) => { valid: boolean; message?: string };

  // Content change handler (optional - for word counting)
  onContentChange?: (content: string) => number; // Returns word count
}

export function WritingExercisePage<T>({
  title,
  subtitle,
  allExercises,
  getExerciseLevel,
  getExerciseTitle,
  getExerciseDifficulty,
  renderExerciseInfo,
  renderWorkspace,
  renderSelector,
  validateSubmit,
  onContentChange,
}: WritingExercisePageProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useFirebaseAuth();
  const { showToast } = useToast();

  const [level, setLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [selectedExercise, setSelectedExercise] = useState<T | null>(null);
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Handle level from URL params
  useEffect(() => {
    const levelParam = searchParams.get('level');
    if (levelParam && Object.values(CEFRLevel).includes(levelParam as CEFRLevel)) {
      setLevel(levelParam as CEFRLevel);
    }
  }, [searchParams]);

  // Handle word counting
  useEffect(() => {
    if (onContentChange) {
      const count = onContentChange(content);
      setWordCount(count);
    } else {
      // Default word counting
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [content, onContentChange]);

  const handleExerciseSelect = (exercise: T) => {
    setSelectedExercise(exercise);
    setContent('');
    setWordCount(0);
  };

  const handleBack = () => {
    if (selectedExercise) {
      setSelectedExercise(null);
      setContent('');
      setWordCount(0);
    } else {
      router.push('/dashboard/student/writing');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // TODO: Save to Firestore
    setTimeout(() => {
      setIsSaving(false);
      showToast({
        title: 'Draft Saved',
        message: 'Your draft has been saved successfully',
        variant: 'success',
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!selectedExercise) return;

    // Custom validation if provided
    if (validateSubmit) {
      const validation = validateSubmit(selectedExercise, content, wordCount);
      if (!validation.valid) {
        showToast({
          title: 'Validation Error',
          message: validation.message || 'Please check your submission.',
          variant: 'error',
        });
        return;
      }
    } else {
      // Default validation
      if (!content.trim()) {
        showToast({
          title: 'Empty Submission',
          message: 'Please write something before submitting.',
          variant: 'error',
        });
        return;
      }
    }

    setIsSaving(true);
    // TODO: Submit to Firestore and get AI feedback
    setTimeout(() => {
      setIsSaving(false);
      showToast({
        title: 'Submission Successful',
        message: 'Generating feedback...',
        variant: 'success',
      });
      // TODO: Navigate to feedback page
    }, 1500);
  };

  const filteredExercises = allExercises.filter(ex => getExerciseLevel(ex) === level);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={selectedExercise ? getExerciseTitle(selectedExercise) : title}
        subtitle={
          selectedExercise
            ? `${CEFRLevelInfo[getExerciseLevel(selectedExercise)].displayName}${getExerciseDifficulty ? ` • ${getExerciseDifficulty(selectedExercise)}` : ''}`
            : subtitle
        }
        backButton={{
          label: selectedExercise ? 'Back to Exercises' : 'Back to Writing Hub',
          onClick: handleBack
        }}
        actions={
          selectedExercise && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || !content.trim()}
                className="cursor-pointer whitespace-nowrap content-center font-medium transition-all duration-150 ease-in-out h-12 rounded-xl bg-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || !content.trim()}
                className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out h-12 rounded-xl bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          )
        }
      />

      <div className="container mx-auto px-0 md:px-6 py-0 md:py-8">
        {selectedExercise ? (
          <div className="lg:max-w-6xl mx-auto">
            <div className="px-6 md:px-0 py-4 md:py-0">
              {renderExerciseInfo(selectedExercise)}
            </div>
            {renderWorkspace(selectedExercise, content, setContent, wordCount)}
          </div>
        ) : (
          <div className="px-6">
            {renderSelector(filteredExercises, handleExerciseSelect)}
          </div>
        )}
      </div>

      {/* Floating Redemittel Widget - Always show for testing */}
      <FloatingRedemittelWidget currentLevel={selectedExercise ? getExerciseLevel(selectedExercise) : undefined} />
    </div>
  );
}

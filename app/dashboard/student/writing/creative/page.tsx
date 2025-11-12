'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CreativeWritingInstructions } from '@/components/writing/CreativeWritingInstructions';
import { CreativeWritingArea } from '@/components/writing/CreativeWritingArea';
import { CreativeExerciseSelector } from '@/components/writing/CreativeExerciseSelector';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { CreativeWritingExercise } from '@/lib/models/writing';
import { CREATIVE_EXERCISES } from '@/lib/data/creativeExercises';

function CreativeWritingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useFirebaseAuth();
  const [level, setLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [selectedExercise, setSelectedExercise] = useState<CreativeWritingExercise | null>(null);
  const [writingContent, setWritingContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const levelParam = searchParams.get('level');
    if (levelParam && Object.values(CEFRLevel).includes(levelParam as CEFRLevel)) {
      setLevel(levelParam as CEFRLevel);
    }
  }, [searchParams]);

  useEffect(() => {
    // Count words
    const words = writingContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [writingContent]);

  const handleExerciseSelect = (exercise: CreativeWritingExercise) => {
    setSelectedExercise(exercise);
    setWritingContent('');
    setWordCount(0);
  };

  const handleBack = () => {
    if (selectedExercise) {
      setSelectedExercise(null);
      setWritingContent('');
    } else {
      router.push('/dashboard/student/writing');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // TODO: Save to Firestore
    setTimeout(() => {
      setIsSaving(false);
      alert('Draft saved successfully!');
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!selectedExercise) return;

    if (wordCount < selectedExercise.minWords) {
      alert(`Your writing needs at least ${selectedExercise.minWords} words. You have ${wordCount}.`);
      return;
    }

    if (selectedExercise.maxWords && wordCount > selectedExercise.maxWords) {
      alert(`Your writing exceeds the maximum of ${selectedExercise.maxWords} words. You have ${wordCount}.`);
      return;
    }

    setIsSaving(true);
    // TODO: Submit to Firestore and get AI feedback
    setTimeout(() => {
      setIsSaving(false);
      alert('Submission successful! Generating feedback...');
      // TODO: Navigate to feedback page
    }, 1500);
  };

  const filteredExercises = CREATIVE_EXERCISES.filter(ex => ex.level === level);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={selectedExercise ? selectedExercise.title : 'Creative Writing ✨'}
        subtitle={selectedExercise ? `${CEFRLevelInfo[level].displayName} • ${selectedExercise.difficulty}` : 'Express yourself in German'}
        backButton={{
          label: selectedExercise ? 'Back to Exercises' : 'Back to Writing Hub',
          onClick: handleBack
        }}
        actions={
          selectedExercise && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || wordCount === 0}
                className="cursor-pointer whitespace-nowrap content-center font-medium transition-all duration-150 ease-in-out h-12 rounded-xl bg-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || wordCount === 0}
                className="cursor-pointer whitespace-nowrap content-center font-bold transition-all duration-150 ease-in-out h-12 rounded-xl bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          )
        }
      />

      <div className="container mx-auto px-6 py-8">
        {selectedExercise ? (
          <div className="max-w-4xl mx-auto">
            <CreativeWritingInstructions exercise={selectedExercise} />
            <CreativeWritingArea
              exercise={selectedExercise}
              content={writingContent}
              wordCount={wordCount}
              onChange={setWritingContent}
            />
          </div>
        ) : (
          <CreativeExerciseSelector
            exercises={filteredExercises}
            onSelect={handleExerciseSelect}
          />
        )}
      </div>
    </div>
  );
}

export default function CreativeWritingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreativeWritingContent />
    </Suspense>
  );
}

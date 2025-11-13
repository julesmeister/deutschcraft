'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { TranslationExerciseInfo } from '@/components/writing/TranslationExerciseInfo';
import { TranslationWorkspace } from '@/components/writing/TranslationWorkspace';
import { TranslationExerciseSelector } from '@/components/writing/TranslationExerciseSelector';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { TranslationExercise } from '@/lib/models/writing';
import { TRANSLATION_EXERCISES } from '@/lib/data/translationExercises';

function TranslationPracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useFirebaseAuth();
  const [level, setLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [selectedExercise, setSelectedExercise] = useState<TranslationExercise | null>(null);
  const [translationText, setTranslationText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const levelParam = searchParams.get('level');
    if (levelParam && Object.values(CEFRLevel).includes(levelParam as CEFRLevel)) {
      setLevel(levelParam as CEFRLevel);
    }
  }, [searchParams]);

  const handleExerciseSelect = (exercise: TranslationExercise) => {
    setSelectedExercise(exercise);
    setTranslationText('');
  };

  const handleBack = () => {
    if (selectedExercise) {
      setSelectedExercise(null);
      setTranslationText('');
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
    if (!selectedExercise || !translationText.trim()) {
      alert('Please write your translation before submitting.');
      return;
    }

    setIsSaving(true);
    // TODO: Submit to Firestore and get AI feedback comparing with correctGermanText
    setTimeout(() => {
      setIsSaving(false);
      alert('Submission successful! Generating feedback...');
      // TODO: Navigate to feedback page with comparison
    }, 1500);
  };

  const filteredExercises = TRANSLATION_EXERCISES.filter(ex => ex.level === level);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={selectedExercise ? selectedExercise.title : 'Translation Practice 🔄'}
        subtitle={selectedExercise ? `${CEFRLevelInfo[level].displayName} • ${selectedExercise.difficulty}` : 'Translate English to German'}
        backButton={{
          label: selectedExercise ? 'Back to Exercises' : 'Back to Writing Hub',
          onClick: handleBack
        }}
        actions={
          selectedExercise && (
            <div className="flex gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || !translationText.trim()}
                className="cursor-pointer whitespace-nowrap content-center font-medium transition-all duration-150 ease-in-out h-12 rounded-xl bg-gray-200 px-5 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || !translationText.trim()}
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
            <TranslationExerciseInfo exercise={selectedExercise} />
            <TranslationWorkspace
              exercise={selectedExercise}
              translationText={translationText}
              onChange={setTranslationText}
            />
          </div>
        ) : (
          <TranslationExerciseSelector
            exercises={filteredExercises}
            onSelect={handleExerciseSelect}
          />
        )}
      </div>
    </div>
  );
}

export default function TranslationPracticePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranslationPracticeContent />
    </Suspense>
  );
}

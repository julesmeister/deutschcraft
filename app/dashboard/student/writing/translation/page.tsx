'use client';

import { Suspense } from 'react';
import { WritingExercisePage } from '@/components/writing/WritingExercisePage';
import { TranslationExerciseInfo } from '@/components/writing/TranslationExerciseInfo';
import { TranslationWorkspace } from '@/components/writing/TranslationWorkspace';
import { TranslationExerciseSelector } from '@/components/writing/TranslationExerciseSelector';
import { TranslationExercise } from '@/lib/models/writing';
import { TRANSLATION_EXERCISES } from '@/lib/data/translationExercises';

function TranslationPracticeContent() {
  return (
    <WritingExercisePage<TranslationExercise>
      title="Translation Practice 🔄"
      subtitle="Translate English to German"
      allExercises={TRANSLATION_EXERCISES}
      getExerciseLevel={(ex) => ex.level}
      getExerciseTitle={(ex) => ex.title}
      getExerciseDifficulty={(ex) => ex.difficulty}
      renderExerciseInfo={(ex) => <TranslationExerciseInfo exercise={ex} />}
      renderWorkspace={(ex, content, onChange) => (
        <TranslationWorkspace
          exercise={ex}
          translationText={content}
          onChange={onChange}
        />
      )}
      renderSelector={(exercises, onSelect) => (
        <TranslationExerciseSelector
          exercises={exercises}
          onSelect={onSelect}
        />
      )}
    />
  );
}

export default function TranslationPracticePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranslationPracticeContent />
    </Suspense>
  );
}

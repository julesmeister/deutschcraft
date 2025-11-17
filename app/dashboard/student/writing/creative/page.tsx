'use client';

import { Suspense } from 'react';
import { WritingExercisePage } from '@/components/writing/WritingExercisePage';
import { CreativeWritingInstructions } from '@/components/writing/CreativeWritingInstructions';
import { CreativeWritingArea } from '@/components/writing/CreativeWritingArea';
import { CreativeExerciseSelector } from '@/components/writing/CreativeExerciseSelector';
import { CreativeWritingExercise } from '@/lib/models/writing';
import { CREATIVE_EXERCISES } from '@/lib/data/creativeExercises';

function CreativeWritingContent() {
  return (
    <WritingExercisePage<CreativeWritingExercise>
      title="Creative Writing ✍️"
      subtitle="Write creative stories in German"
      allExercises={CREATIVE_EXERCISES}
      getExerciseLevel={(ex) => ex.level}
      getExerciseTitle={(ex) => ex.title}
      getExerciseDifficulty={(ex) => ex.difficulty}
      renderExerciseInfo={(ex) => <CreativeWritingInstructions exercise={ex} />}
      renderWorkspace={(ex, content, onChange, wordCount) => (
        <CreativeWritingArea
          exercise={ex}
          content={content}
          wordCount={wordCount || 0}
          onChange={onChange}
        />
      )}
      renderSelector={(exercises, onSelect) => (
        <CreativeExerciseSelector
          exercises={exercises}
          onSelect={onSelect}
        />
      )}
      validateSubmit={(ex, content, wordCount) => {
        if (wordCount < ex.minWords) {
          return {
            valid: false,
            message: `Your writing needs at least ${ex.minWords} words. You have ${wordCount}.`
          };
        }
        if (ex.maxWords && wordCount > ex.maxWords) {
          return {
            valid: false,
            message: `Your writing exceeds the maximum of ${ex.maxWords} words. You have ${wordCount}.`
          };
        }
        return { valid: true };
      }}
    />
  );
}

export default function CreativeWritingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreativeWritingContent />
    </Suspense>
  );
}

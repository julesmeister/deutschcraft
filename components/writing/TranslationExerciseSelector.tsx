/**
 * TranslationExerciseSelector Component
 * Grid display of available translation exercises
 */

import { TranslationExercise } from '@/lib/models/writing';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseGrid } from './ExerciseGrid';
import { ExerciseFooter } from './ExerciseFooter';

interface TranslationExerciseSelectorProps {
  exercises: TranslationExercise[];
  onSelect: (exercise: TranslationExercise) => void;
  attemptedExerciseIds?: Set<string>;
}

export function TranslationExerciseSelector({ exercises, onSelect, attemptedExerciseIds }: TranslationExerciseSelectorProps) {
  return (
    <ExerciseGrid
      isEmpty={exercises.length === 0}
      emptyState={{
        icon: '🔄',
        title: 'No translation exercises available',
        description: 'Try selecting a different level or check back later'
      }}
    >
      {exercises.map((exercise) => {
        // Split english text into sentences and take first 3
        const sentences = exercise.englishText
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .slice(0, 3);

        return (
          <ExerciseCard
            key={exercise.exerciseId}
            icon=""
            title={exercise.title}
            difficulty={exercise.difficulty}
            onClick={() => onSelect(exercise)}
            isAttempted={attemptedExerciseIds?.has(exercise.exerciseId)}
            description={exercise.category}
            sampleSentences={sentences}
            footerLeft={`⏱️ ${exercise.estimatedTime} min`}
            footerRight={`📝 ${exercise.targetVocabulary.length} words`}
          />
        );
      })}
    </ExerciseGrid>
  );
}

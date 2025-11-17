'use client';

import { Suspense } from 'react';
import { WritingExercisePage } from '@/components/writing/WritingExercisePage';
import { LetterTemplateInstructions } from '@/components/writing/LetterTemplateInstructions';
import { LetterWritingArea } from '@/components/writing/LetterWritingArea';
import { LetterTemplateSelector } from '@/components/writing/LetterTemplateSelector';
import { LetterTemplate } from '@/lib/models/writing';
import { LETTER_TEMPLATES } from '@/lib/data/letterTemplates';

function LettersWritingContent() {
  return (
    <WritingExercisePage<LetterTemplate>
      title="Letter Writing ✉️"
      subtitle="Practice writing formal and informal letters in German"
      allExercises={LETTER_TEMPLATES}
      getExerciseLevel={(template) => template.level}
      getExerciseTitle={(template) => template.title}
      getExerciseDifficulty={(template) => template.difficulty}
      renderExerciseInfo={(template) => <LetterTemplateInstructions template={template} />}
      renderWorkspace={(template, content, onChange, wordCount) => (
        <LetterWritingArea
          template={template}
          content={content}
          wordCount={wordCount || 0}
          onChange={onChange}
        />
      )}
      renderSelector={(templates, onSelect) => (
        <LetterTemplateSelector
          templates={templates}
          onSelect={onSelect}
        />
      )}
    />
  );
}

export default function LettersWritingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LettersWritingContent />
    </Suspense>
  );
}

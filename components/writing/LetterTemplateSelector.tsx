/**
 * LetterTemplateSelector Component
 * Grid of letter templates to choose from
 */

import { LetterTemplate } from '@/lib/data/letterTemplates';
import { ExerciseGrid } from './ExerciseGrid';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseFooter } from './ExerciseFooter';

interface LetterTemplateSelectorProps {
  templates: LetterTemplate[];
  onSelect: (template: LetterTemplate) => void;
  attemptedExerciseIds?: Set<string>;
}

export function LetterTemplateSelector({
  templates,
  onSelect,
  attemptedExerciseIds
}: LetterTemplateSelectorProps) {
  return (
    <ExerciseGrid
      isEmpty={templates.length === 0}
      emptyState={{
        icon: '📭',
        title: 'No templates for this level',
        description: 'Try selecting a different CEFR level'
      }}
    >
      {templates.map((template) => {
        // Extract key points from scenario
        const scenarioPoints = template.scenario
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .slice(0, 3);

        return (
          <ExerciseCard
            key={template.id}
            icon="✉️"
            title={template.title}
            difficulty={template.difficulty}
            onClick={() => onSelect(template)}
            isAttempted={attemptedExerciseIds?.has(template.id)}
            description={template.type}
            sampleSentences={scenarioPoints}
            footerLeft={`⏱️ 25-35 min`}
            footerRight={`📝 ${template.minWords}+ words`}
          />
        );
      })}
    </ExerciseGrid>
  );
}

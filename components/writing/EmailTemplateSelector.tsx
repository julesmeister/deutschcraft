/**
 * EmailTemplateSelector Component
 * Grid display of available email templates
 */

import { EmailTemplate } from '@/lib/data/emailTemplates';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseGrid } from './ExerciseGrid';
import { ExerciseFooter } from './ExerciseFooter';

interface EmailTemplateSelectorProps {
  templates: EmailTemplate[];
  onSelect: (template: EmailTemplate) => void;
  attemptedExerciseIds?: Set<string>;
}

export function EmailTemplateSelector({ templates, onSelect, attemptedExerciseIds }: EmailTemplateSelectorProps) {
  return (
    <ExerciseGrid
      isEmpty={templates.length === 0}
      emptyState={{
        icon: '📧',
        title: 'No email templates available',
        description: 'Try selecting a different level'
      }}
    >
      {templates.map((template) => (
        <ExerciseCard
          key={template.id}
          icon=""
          title={template.title}
          difficulty={template.difficulty}
          onClick={() => onSelect(template)}
          isAttempted={attemptedExerciseIds?.has(template.id)}
          description={
            <p className="text-sm text-neutral-600 line-clamp-2">
              {template.scenario}
            </p>
          }
          footer={
            <ExerciseFooter
              left={`${template.minWords}+ words`}
              right={`${template.structure.length} sections`}
            />
          }
        />
      ))}
    </ExerciseGrid>
  );
}

/**
 * EmailTemplateSelector Component
 * Grid display of available email templates
 */

import { EmailTemplate } from '@/lib/data/emailTemplates';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseGrid } from './ExerciseGrid';

interface EmailTemplateSelectorProps {
  templates: EmailTemplate[];
  onSelect: (template: EmailTemplate) => void;
}

export function EmailTemplateSelector({ templates, onSelect }: EmailTemplateSelectorProps) {
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
          description={
            <p className="text-sm text-neutral-600 line-clamp-2">
              {template.scenario}
            </p>
          }
          footer={`${template.minWords}+ words • ${template.structure.length} sections`}
        />
      ))}
    </ExerciseGrid>
  );
}

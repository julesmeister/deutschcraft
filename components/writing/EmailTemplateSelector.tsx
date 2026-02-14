/**
 * EmailTemplateSelector Component
 * Grid display of available email templates
 */

import { useRouter } from 'next/navigation';
import { EmailTemplate } from '@/lib/data/emailTemplates';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseGrid } from './ExerciseGrid';

interface EmailTemplateSelectorProps {
  templates: EmailTemplate[];
  onSelect: (template: EmailTemplate) => void;
  attemptedExerciseIds?: Set<string>;
}

export function EmailTemplateSelector({ templates, onSelect, attemptedExerciseIds }: EmailTemplateSelectorProps) {
  const router = useRouter();

  return (
    <ExerciseGrid
      isEmpty={templates.length === 0}
      emptyState={{
        icon: '📧',
        title: 'No email templates available',
        description: 'Try selecting a different level'
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
            icon="📧"
            title={template.title}
            difficulty={template.difficulty}
            onClick={() => router.push(`/dashboard/student/writing/emails/${template.id}`)}
            isAttempted={attemptedExerciseIds?.has(template.id)}
            description="Email"
            sampleSentences={scenarioPoints}
            footerLeft={`⏱️ 20-30 min`}
            footerRight={`📝 ${template.minWords}+ words`}
          />
        );
      })}
    </ExerciseGrid>
  );
}

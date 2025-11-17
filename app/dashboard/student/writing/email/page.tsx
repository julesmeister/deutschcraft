'use client';

import { Suspense } from 'react';
import { WritingExercisePage } from '@/components/writing/WritingExercisePage';
import { EmailTemplateInstructions } from '@/components/writing/EmailTemplateInstructions';
import { EmailWritingForm } from '@/components/writing/EmailWritingForm';
import { EmailTemplateSelector } from '@/components/writing/EmailTemplateSelector';
import { EmailTemplate } from '@/lib/models/writing';
import { EMAIL_TEMPLATES } from '@/lib/data/emailTemplates';

function EmailWritingContent() {
  return (
    <WritingExercisePage<EmailTemplate>
      title="Email Writing 📧"
      subtitle="Practice writing professional emails in German"
      allExercises={EMAIL_TEMPLATES}
      getExerciseLevel={(template) => template.level}
      getExerciseTitle={(template) => template.title}
      getExerciseDifficulty={(template) => template.difficulty}
      renderExerciseInfo={(template) => <EmailTemplateInstructions template={template} />}
      renderWorkspace={(template, content, onChange, wordCount) => (
        <EmailWritingForm
          template={template}
          emailContent={content}
          wordCount={wordCount || 0}
          onChange={onChange}
        />
      )}
      renderSelector={(templates, onSelect) => (
        <EmailTemplateSelector
          templates={templates}
          onSelect={onSelect}
        />
      )}
    />
  );
}

export default function EmailWritingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailWritingContent />
    </Suspense>
  );
}

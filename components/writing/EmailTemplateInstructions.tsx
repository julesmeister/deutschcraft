/**
 * EmailTemplateInstructions Component
 * Displays scenario, structure, and key phrases for email writing exercise
 */

import { EmailTemplate } from '@/lib/data/emailTemplates';

interface EmailTemplateInstructionsProps {
  template: EmailTemplate;
}

export function EmailTemplateInstructions({ template }: EmailTemplateInstructionsProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-bold text-neutral-900 mb-3">📋 Scenario</h3>
      <p className="text-neutral-700 mb-4">{template.scenario}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-sm font-semibold text-neutral-900">Required structure:</span>
          <ul className="mt-2 space-y-1">
            {template.structure.map((item, idx) => (
              <li key={idx} className="text-sm text-neutral-700 flex items-center gap-2">
                <span className="text-blue-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-sm font-semibold text-neutral-900">Key phrases:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {template.keyPhrases.map((phrase, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm text-neutral-600">
        Minimum words: <span className="font-semibold">{template.minWords}</span>
      </div>
    </div>
  );
}

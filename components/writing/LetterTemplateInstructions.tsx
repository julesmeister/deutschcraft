/**
 * LetterTemplateInstructions Component
 * Displays instructions and structure for a letter writing template
 */

import { LetterTemplate } from '@/lib/data/letterTemplates';

interface LetterTemplateInstructionsProps {
  template: LetterTemplate;
}

export function LetterTemplateInstructions({ template }: LetterTemplateInstructionsProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{template.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-neutral-900">
              {template.type === 'formal' ? 'Formal Letter' : 'Informal Letter'}
            </h3>
            <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {template.type}
            </span>
          </div>
          <p className="text-neutral-700 mb-3">{template.scenario}</p>
          <div className="text-sm text-neutral-600 mb-3">
            <strong>Format:</strong> {template.format}
          </div>
        </div>
      </div>

      {/* Structure Guide */}
      <div className="bg-white border border-purple-200 rounded-xl p-4 mb-4">
        <h4 className="text-sm font-bold text-neutral-900 mb-2">📋 Required Structure:</h4>
        <ol className="space-y-1">
          {template.structure.map((item, idx) => (
            <li key={idx} className="text-sm text-neutral-700 flex gap-2">
              <span className="text-purple-600 font-semibold">{idx + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Key Phrases */}
      <div>
        <h4 className="text-sm font-bold text-neutral-900 mb-2">💡 Key Phrases:</h4>
        <div className="flex flex-wrap gap-2">
          {template.keyPhrases.map((phrase, idx) => (
            <span
              key={idx}
              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium"
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-neutral-600">
        Minimum words: <span className="font-semibold">{template.minWords}</span>
      </div>
    </div>
  );
}

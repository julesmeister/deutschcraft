/**
 * LetterWritingArea Component
 * Uses reusable WritingWorkspace component
 */

import { ReactNode } from 'react';
import { LetterTemplate } from '@/lib/data/letterTemplates';
import { WritingWorkspace } from './WritingWorkspace';

interface LetterWritingAreaProps {
  template: LetterTemplate;
  content: string;
  wordCount: number;
  onChange: (content: string) => void;
  attemptCount?: number;
  attemptHistory?: ReactNode;
  readOnly?: boolean;
  viewingAttempt?: { attemptNumber: number; status: string };
}

export function LetterWritingArea({
  template,
  content,
  wordCount,
  onChange,
  attemptCount,
  attemptHistory,
  readOnly,
  viewingAttempt
}: LetterWritingAreaProps) {
  const topIndicator = (
    <div className="text-sm font-medium">
      <span className={wordCount < template.minWords ? 'text-amber-600' : 'text-emerald-600'}>
        {wordCount}
      </span>
      <span className="text-gray-400 mx-1">/</span>
      <span className="text-gray-500">{template.minWords}+ words</span>
    </div>
  );

  const instructions = (
    <>
      {/* Letter Template Info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{template.icon}</span>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {template.type === 'formal' ? 'Formal Letter' : 'Informal Letter'}
          </h3>
        </div>
        <p className="text-base text-gray-900 leading-relaxed mb-4">
          {template.scenario}
        </p>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Format:</span> {template.format}
        </div>
      </div>

      {/* Structure Guide */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">📋 Required Structure</h4>
        <ol className="space-y-2 text-sm text-gray-600 pl-5">
          {template.structure.map((item, idx) => (
            <li key={idx} className="list-decimal">{item}</li>
          ))}
        </ol>
      </div>

      {/* Key Phrases */}
      {template.keyPhrases && template.keyPhrases.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Key Phrases</h4>
          <div className="flex flex-wrap gap-2">
            {template.keyPhrases.map((phrase, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Letter Tips */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          {template.type === 'formal' ? (
            <>
              <li>• Use complete address blocks</li>
              <li>• Include date and place</li>
              <li>• Use formal language (Sie)</li>
              <li>• End with "Mit freundlichen Grüßen"</li>
            </>
          ) : (
            <>
              <li>• Start with friendly greeting</li>
              <li>• Use informal language (du)</li>
              <li>• Be natural and conversational</li>
              <li>• End warmly (Liebe Grüße)</li>
            </>
          )}
        </ul>
      </div>
    </>
  );

  return (
    <WritingWorkspace
      value={content}
      onChange={onChange}
      placeholder={
        template.type === 'formal'
          ? "Begin with the sender's address...\n\n[Your Address]\n[City, Postal Code]\n\n[Recipient's Address]\n[City, Postal Code]\n\n[Date]\n\nSehr geehrte Damen und Herren,\n\n..."
          : "Begin your letter...\n\n[Date]\n\nLiebe/r [Name],\n\n..."
      }
      topIndicator={topIndicator}
      instructions={instructions}
      attemptCount={attemptCount}
      attemptHistory={attemptHistory}
      readOnly={readOnly}
      viewingAttempt={viewingAttempt}
    />
  );
}

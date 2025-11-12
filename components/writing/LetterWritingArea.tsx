/**
 * LetterWritingArea Component
 * Text area for writing letters with word count and formatting tips
 */

import { LetterTemplate } from '@/lib/data/letterTemplates';

interface LetterWritingAreaProps {
  template: LetterTemplate;
  content: string;
  wordCount: number;
  onChange: (content: string) => void;
}

export function LetterWritingArea({ template, content, wordCount, onChange }: LetterWritingAreaProps) {
  return (
    <>
      {/* Writing Area */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-neutral-900">Your Letter</h3>
          <span className={`text-sm font-medium ${
            wordCount < template.minWords ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {wordCount} / {template.minWords}+ words
          </span>
        </div>

        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={template.type === 'formal'
            ? "Begin with the sender's address...\n\n[Your Address]\n[City, Postal Code]\n\n[Recipient's Address]\n[City, Postal Code]\n\n[Date]\n\nSehr geehrte Damen und Herren,\n\n..."
            : "Begin your letter...\n\n[Date]\n\nLiebe/r [Name],\n\n..."
          }
          className="w-full h-[500px] p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
          style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}
        />
      </div>

      {/* Format Tips */}
      <div className={`border rounded-2xl p-5 ${
        template.type === 'formal'
          ? 'bg-blue-50 border-blue-200'
          : 'bg-pink-50 border-pink-200'
      }`}>
        <h4 className={`text-sm font-bold mb-2 ${
          template.type === 'formal' ? 'text-blue-900' : 'text-pink-900'
        }`}>
          💡 {template.type === 'formal' ? 'Formal' : 'Informal'} Letter Tips:
        </h4>
        <ul className={`space-y-1 text-sm ${
          template.type === 'formal' ? 'text-blue-800' : 'text-pink-800'
        }`}>
          {template.type === 'formal' ? (
            <>
              <li>• Use complete address blocks (sender and recipient)</li>
              <li>• Include date and place</li>
              <li>• Start with "Sehr geehrte Damen und Herren" or specific name</li>
              <li>• Use formal language (Sie, not du)</li>
              <li>• End with "Mit freundlichen Grüßen" or "Hochachtungsvoll"</li>
              <li>• Sign with your full name</li>
            </>
          ) : (
            <>
              <li>• Start with a friendly greeting (Liebe/r, Hallo)</li>
              <li>• Use informal language (du, not Sie)</li>
              <li>• Share personal news and ask questions</li>
              <li>• Use contractions and casual expressions</li>
              <li>• End warmly (Liebe Grüße, Bis bald, Dein/e)</li>
              <li>• Be natural and conversational</li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

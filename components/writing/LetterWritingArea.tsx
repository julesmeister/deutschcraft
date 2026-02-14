/**
 * LetterWritingArea Component
 * Structured letter workspace with header fields for formal/informal letters
 * and a format hint overlay showing proper German letter layout
 */

import { ReactNode, useState, useRef } from 'react';
import { LetterTemplate } from '@/lib/data/letterTemplates';
import { WritingWorkspace } from './WritingWorkspace';
import { GermanCharAutocomplete } from './GermanCharAutocomplete';
import { FileText, X } from 'lucide-react';

export interface LetterHeaderValues {
  sender?: string;
  date?: string;
  recipient?: string;
  subject?: string;
  greeting?: string;
}

interface LetterWritingAreaProps {
  template: LetterTemplate;
  content: string;
  wordCount: number;
  onChange: (content: string) => void;
  attemptCount?: number;
  attemptHistory?: ReactNode;
  readOnly?: boolean;
  viewingAttempt?: { attemptNumber: number; status: string };
  headerValues?: LetterHeaderValues;
  onHeaderChange?: (values: LetterHeaderValues) => void;
}

export function LetterWritingArea({
  template,
  content,
  wordCount,
  onChange,
  attemptCount,
  attemptHistory,
  readOnly,
  viewingAttempt,
  headerValues,
  onHeaderChange
}: LetterWritingAreaProps) {
  const [showFormatHint, setShowFormatHint] = useState(false);
  const isFormal = template.type === 'formal';

  const topIndicator = (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium">
        <span className={wordCount < template.minWords ? 'text-amber-600' : 'text-emerald-600'}>
          {wordCount}
        </span>
        <span className="text-gray-400 mx-1">/</span>
        <span className="text-gray-500">{template.minWords}+ words</span>
      </div>
      <button
        onClick={() => setShowFormatHint(!showFormatHint)}
        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
        title="Show letter format guide"
      >
        <FileText className="w-3.5 h-3.5" />
        Format Guide
      </button>
    </div>
  );

  const headerFields = isFormal ? (
    <FormalLetterHeader readOnly={readOnly} values={headerValues} onChange={onHeaderChange} />
  ) : (
    <InformalLetterHeader readOnly={readOnly} values={headerValues} onChange={onHeaderChange} />
  );

  const instructions = (
    <>
      {/* Format Hint Overlay */}
      {showFormatHint && (
        <FormatHintCard
          isFormal={isFormal}
          onClose={() => setShowFormatHint(false)}
        />
      )}

      {/* Letter Template Info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{template.icon}</span>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {isFormal ? 'Formal Letter' : 'Informal Letter'}
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
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Required Structure</h4>
        <ol className="space-y-2 text-sm text-gray-600 pl-5">
          {template.structure.map((item, idx) => (
            <li key={idx} className="list-decimal">{item}</li>
          ))}
        </ol>
      </div>

      {/* Key Phrases */}
      {template.keyPhrases && template.keyPhrases.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Phrases</h4>
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
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          {isFormal ? (
            <>
              <li>• Use complete address blocks</li>
              <li>• Include date and place</li>
              <li>• Use formal language (Sie)</li>
              <li>• End with &quot;Mit freundlichen Gr&uuml;&szlig;en&quot;</li>
            </>
          ) : (
            <>
              <li>• Start with friendly greeting</li>
              <li>• Use informal language (du)</li>
              <li>• Be natural and conversational</li>
              <li>• End warmly (Liebe Gr&uuml;&szlig;e)</li>
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
        isFormal
          ? "Write the body of your formal letter here...\n\nStart with your main message after the greeting above."
          : "Write your letter here...\n\nShare your news, ask questions, and be conversational."
      }
      topIndicator={topIndicator}
      additionalFields={headerFields}
      instructions={instructions}
      attemptCount={attemptCount}
      attemptHistory={attemptHistory}
      readOnly={readOnly}
      viewingAttempt={viewingAttempt}
    />
  );
}

/** Structured header for formal German letters */
export function FormalLetterHeader({ readOnly, values, onChange }: {
  readOnly?: boolean;
  values?: LetterHeaderValues;
  onChange?: (values: LetterHeaderValues) => void;
}) {
  const update = (key: keyof LetterHeaderValues, v: string) => {
    onChange?.({ ...values, [key]: v });
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Sender (left) + Date/Place (right) */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <LetterField
            label="Absender (Sender)"
            placeholder="Max Mustermann&#10;Musterstraße 1&#10;12345 Berlin"
            multiline
            readOnly={readOnly}
            value={values?.sender}
            onValueChange={(v) => update('sender', v)}
          />
        </div>
        <div className="sm:w-48 sm:text-right">
          <LetterField
            label="Ort, Datum"
            placeholder="Berlin, 14.02.2026"
            align="right"
            readOnly={readOnly}
            value={values?.date}
            onValueChange={(v) => update('date', v)}
          />
        </div>
      </div>

      {/* Row 2: Recipient */}
      <LetterField
        label="Empfänger (Recipient)"
        placeholder="Firma GmbH&#10;Frau/Herr Name&#10;Straße Nr.&#10;PLZ Ort"
        multiline
        readOnly={readOnly}
        value={values?.recipient}
        onValueChange={(v) => update('recipient', v)}
      />

      {/* Row 3: Subject line */}
      <LetterField
        label="Betreff (Subject)"
        placeholder="Bewerbung als..."
        bold
        readOnly={readOnly}
        value={values?.subject}
        onValueChange={(v) => update('subject', v)}
      />

      {/* Row 4: Greeting */}
      <LetterField
        label="Anrede (Greeting)"
        placeholder="Sehr geehrte Damen und Herren,"
        readOnly={readOnly}
        value={values?.greeting}
        onValueChange={(v) => update('greeting', v)}
      />
    </div>
  );
}

/** Simpler header for informal letters */
export function InformalLetterHeader({ readOnly, values, onChange }: {
  readOnly?: boolean;
  values?: LetterHeaderValues;
  onChange?: (values: LetterHeaderValues) => void;
}) {
  const update = (key: keyof LetterHeaderValues, v: string) => {
    onChange?.({ ...values, [key]: v });
  };

  return (
    <div className="space-y-4">
      {/* Date/Place on the right */}
      <div className="flex justify-end">
        <div className="w-48">
          <LetterField
            label="Ort, Datum"
            placeholder="Berlin, 14.02.2026"
            align="right"
            readOnly={readOnly}
            value={values?.date}
            onValueChange={(v) => update('date', v)}
          />
        </div>
      </div>

      {/* Greeting */}
      <LetterField
        label="Anrede (Greeting)"
        placeholder="Liebe/r ...,"
        readOnly={readOnly}
        value={values?.greeting}
        onValueChange={(v) => update('greeting', v)}
      />
    </div>
  );
}

/** Reusable letter field with faint border styling and German umlaut autocomplete */
function LetterField({
  label,
  placeholder,
  multiline,
  bold,
  align,
  readOnly,
  value,
  onValueChange,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
  bold?: boolean;
  align?: 'left' | 'right';
  readOnly?: boolean;
  value?: string;
  onValueChange?: (v: string) => void;
}) {
  const fieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const baseClasses = `w-full bg-transparent outline-none placeholder-gray-300 text-gray-900 ${
    bold ? 'font-semibold' : ''
  } ${align === 'right' ? 'text-right' : ''}`;

  return (
    <div className="border border-dashed border-gray-200 rounded-lg px-3 py-2 hover:border-gray-300 focus-within:border-blue-300 transition-colors">
      <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          ref={fieldRef as React.RefObject<HTMLTextAreaElement>}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={3}
          value={value ?? ''}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={`${baseClasses} resize-none text-sm leading-relaxed`}
        />
      ) : (
        <input
          ref={fieldRef as React.RefObject<HTMLInputElement>}
          type="text"
          placeholder={placeholder}
          readOnly={readOnly}
          value={value ?? ''}
          onChange={(e) => onValueChange?.(e.target.value)}
          className={`${baseClasses} text-sm`}
        />
      )}
      {!readOnly && (
        <GermanCharAutocomplete
          textareaRef={fieldRef}
          content={value ?? ''}
          onContentChange={(v) => onValueChange?.(v)}
        />
      )}
    </div>
  );
}

/** Format hint overlay showing proper German letter layout */
function FormatHintCard({
  isFormal,
  onClose,
}: {
  isFormal: boolean;
  onClose: () => void;
}) {
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-blue-400 hover:text-blue-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <h4 className="text-sm font-semibold text-blue-800 mb-4">
        {isFormal ? 'Formal Letter Layout (Formeller Brief)' : 'Informal Letter Layout (Informeller Brief)'}
      </h4>

      {isFormal ? (
        <div className="text-xs font-mono text-blue-700 space-y-2 bg-white rounded-lg p-4 border border-blue-100">
          <div className="flex justify-between">
            <div className="text-blue-500">
              <div>Max Mustermann</div>
              <div>Musterstra&szlig;e 1</div>
              <div>12345 Berlin</div>
            </div>
            <div className="text-right text-blue-500">
              <div>Berlin, 14.02.2026</div>
            </div>
          </div>
          <div className="h-2" />
          <div className="text-blue-500">
            <div>Firma GmbH</div>
            <div>Frau M&uuml;ller</div>
            <div>Hauptstra&szlig;e 10</div>
            <div>10115 Berlin</div>
          </div>
          <div className="h-2" />
          <div className="font-bold text-blue-800">Betreff: Bewerbung als...</div>
          <div className="h-1" />
          <div className="text-blue-600">Sehr geehrte Frau M&uuml;ller,</div>
          <div className="h-1" />
          <div className="text-blue-400 italic">[ Body text... ]</div>
          <div className="h-1" />
          <div className="text-blue-600">Mit freundlichen Gr&uuml;&szlig;en</div>
          <div className="text-blue-500">Max Mustermann</div>
        </div>
      ) : (
        <div className="text-xs font-mono text-blue-700 space-y-2 bg-white rounded-lg p-4 border border-blue-100">
          <div className="text-right text-blue-500">
            <div>Berlin, 14.02.2026</div>
          </div>
          <div className="h-2" />
          <div className="text-blue-600">Liebe Anna,</div>
          <div className="h-1" />
          <div className="text-blue-400 italic">[ Body text... ]</div>
          <div className="h-1" />
          <div className="text-blue-600">Liebe Gr&uuml;&szlig;e</div>
          <div className="text-blue-500">Dein/e [Name]</div>
        </div>
      )}
    </div>
  );
}

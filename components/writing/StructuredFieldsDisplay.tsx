/**
 * StructuredFieldsDisplay Component
 * Read-only display of email/letter structured fields in feedback and grading views
 */

import { WritingSubmission } from '@/lib/models/writing';

interface StructuredFieldsDisplayProps {
  fields: WritingSubmission['structuredFields'];
  exerciseType: string;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-lg px-3 py-2">
      <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-sm text-gray-900 whitespace-pre-wrap">{value}</div>
    </div>
  );
}

export function StructuredFieldsDisplay({ fields, exerciseType }: StructuredFieldsDisplayProps) {
  if (!fields) return null;

  const isEmail = exerciseType === 'email' || (fields.emailTo !== undefined || fields.emailSubject !== undefined);
  const isLetter = exerciseType === 'formal-letter' || exerciseType === 'informal-letter' ||
    fields.letterSender !== undefined || fields.letterDate !== undefined;

  if (isEmail) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📧</span>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Email Fields
          </h3>
        </div>
        <div className="space-y-2">
          {fields.emailTo && <FieldRow label="To (An)" value={fields.emailTo} />}
          {fields.emailSubject && <FieldRow label="Subject (Betreff)" value={fields.emailSubject} />}
        </div>
        <div className="w-full h-px bg-gray-200 mt-6" />
      </div>
    );
  }

  if (isLetter) {
    const isFormal = exerciseType === 'formal-letter' || fields.letterSender !== undefined;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{isFormal ? '✉️' : '💌'}</span>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Letter Header
          </h3>
        </div>
        <div className="space-y-2">
          {fields.letterSender && <FieldRow label="Absender (Sender)" value={fields.letterSender} />}
          {fields.letterDate && <FieldRow label="Ort, Datum" value={fields.letterDate} />}
          {fields.letterRecipient && <FieldRow label="Empfänger (Recipient)" value={fields.letterRecipient} />}
          {fields.letterSubject && <FieldRow label="Betreff (Subject)" value={fields.letterSubject} />}
          {fields.letterGreeting && <FieldRow label="Anrede (Greeting)" value={fields.letterGreeting} />}
        </div>
        <div className="w-full h-px bg-gray-200 mt-6" />
      </div>
    );
  }

  return null;
}

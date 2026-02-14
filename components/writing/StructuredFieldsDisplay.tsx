/**
 * StructuredFieldsDisplay Component
 * Display and optionally edit email/letter structured fields in feedback and grading views
 */

'use client';

import { useState, useRef } from 'react';
import { WritingSubmission } from '@/lib/models/writing';
import {
  FormalLetterHeader,
  InformalLetterHeader,
  LetterHeaderValues,
} from '@/components/writing/LetterWritingArea';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';

type StructuredFields = WritingSubmission['structuredFields'];

interface StructuredFieldsDisplayProps {
  fields?: StructuredFields;
  exerciseType: string;
  editable?: boolean;
  onSave?: (fields: NonNullable<StructuredFields>) => void;
}

function FieldRow({ label, value, align }: { label: string; value: string; align?: 'right' }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-lg px-3 py-2">
      <div className={`text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 ${align === 'right' ? 'text-right' : ''}`}>
        {label}
      </div>
      <div className={`text-sm text-gray-900 whitespace-pre-wrap ${align === 'right' ? 'text-right' : ''}`}>{value}</div>
    </div>
  );
}

function EmailEditForm({
  initialTo,
  initialSubject,
  onSave,
  onCancel,
}: {
  initialTo: string;
  initialSubject: string;
  onSave: (fields: NonNullable<StructuredFields>) => void;
  onCancel: () => void;
}) {
  const [emailTo, setEmailTo] = useState(initialTo);
  const [emailSubject, setEmailSubject] = useState(initialSubject);
  const toRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          To (An)
        </label>
        <input
          ref={toRef}
          type="text"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
          placeholder="recipient@example.com"
        />
        <GermanCharAutocomplete
          textareaRef={toRef}
          content={emailTo}
          onContentChange={setEmailTo}
        />
      </div>
      <div>
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          Subject (Betreff)
        </label>
        <input
          ref={subjectRef}
          type="text"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
          placeholder="Betreff..."
        />
        <GermanCharAutocomplete
          textareaRef={subjectRef}
          content={emailSubject}
          onContentChange={setEmailSubject}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave({ emailTo, emailSubject })}
          className="px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function LetterEditForm({
  exerciseType,
  initialValues,
  onSave,
  onCancel,
}: {
  exerciseType: string;
  initialValues: LetterHeaderValues;
  onSave: (fields: NonNullable<StructuredFields>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<LetterHeaderValues>(initialValues);
  const isFormal = exerciseType === 'formal-letter' || exerciseType === 'formal';

  const handleSave = () => {
    const fields: NonNullable<StructuredFields> = {};
    if (values.sender) fields.letterSender = values.sender;
    if (values.date) fields.letterDate = values.date;
    if (values.recipient) fields.letterRecipient = values.recipient;
    if (values.subject) fields.letterSubject = values.subject;
    if (values.greeting) fields.letterGreeting = values.greeting;
    onSave(fields);
  };

  const HeaderComponent = isFormal ? FormalLetterHeader : InformalLetterHeader;

  return (
    <div className="space-y-3">
      <HeaderComponent values={values} onChange={setValues} />
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className="px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function fieldsToLetterValues(fields?: StructuredFields): LetterHeaderValues {
  if (!fields) return {};
  return {
    sender: fields.letterSender || '',
    date: fields.letterDate || '',
    recipient: fields.letterRecipient || '',
    subject: fields.letterSubject || '',
    greeting: fields.letterGreeting || '',
  };
}

export function StructuredFieldsDisplay({
  fields,
  exerciseType,
  editable,
  onSave,
}: StructuredFieldsDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);

  const isEmail = exerciseType === 'email';
  const isFormalLetter = exerciseType === 'formal-letter' || exerciseType === 'formal';
  const isInformalLetter = exerciseType === 'informal-letter' || exerciseType === 'informal';
  const isLetter = isFormalLetter || isInformalLetter;
  const hasFields = fields && Object.values(fields).some(Boolean);

  // Not an email/letter type — nothing to show
  if (!isEmail && !isLetter) return null;

  const handleSave = (newFields: NonNullable<StructuredFields>) => {
    onSave?.(newFields);
    setIsEditing(false);
  };

  const handleCancel = () => setIsEditing(false);

  // No fields yet — show "Add" button if editable
  if (!hasFields && !isEditing) {
    if (!editable) return null;
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors w-full justify-center"
        >
          <span>{isEmail ? '📧' : '✉️'}</span>
          Add Header Fields
        </button>
      </div>
    );
  }

  // Editing mode
  if (isEditing) {
    const icon = isEmail ? '📧' : isFormalLetter ? '✉️' : '💌';
    const label = isEmail ? 'Email Fields' : 'Letter Header';

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {label}
          </h3>
        </div>
        {isEmail ? (
          <EmailEditForm
            initialTo={fields?.emailTo || ''}
            initialSubject={fields?.emailSubject || ''}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <LetterEditForm
            exerciseType={exerciseType}
            initialValues={fieldsToLetterValues(fields)}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  }

  // Read-only display
  if (isEmail) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📧</span>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Email Fields
          </h3>
          {editable && (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-auto text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>✏️</span> Edit
            </button>
          )}
        </div>
        <div className="space-y-2">
          {fields?.emailTo && <FieldRow label="To (An)" value={fields.emailTo} />}
          {fields?.emailSubject && <FieldRow label="Subject (Betreff)" value={fields.emailSubject} />}
        </div>
      </div>
    );
  }

  // Letter display
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{isFormalLetter ? '✉️' : '💌'}</span>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Letter Header
        </h3>
        {editable && (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-auto text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>✏️</span> Edit
          </button>
        )}
      </div>
      <div className="space-y-2">
        {/* Row 1: Sender (left) + Ort, Datum (right) — mirrors actual letter layout */}
        {(fields?.letterSender || fields?.letterDate) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {isFormalLetter && fields?.letterSender && (
              <div className="flex-1">
                <FieldRow label="Absender (Sender)" value={fields.letterSender} />
              </div>
            )}
            {fields?.letterDate && (
              <div className={`sm:w-48 ${!isFormalLetter ? 'sm:ml-auto' : ''}`}>
                <FieldRow label="Ort, Datum" value={fields.letterDate} align="right" />
              </div>
            )}
          </div>
        )}
        {fields?.letterRecipient && <FieldRow label="Empfänger (Recipient)" value={fields.letterRecipient} />}
        {fields?.letterSubject && <FieldRow label="Betreff (Subject)" value={fields.letterSubject} />}
        {fields?.letterGreeting && <FieldRow label="Anrede (Greeting)" value={fields.letterGreeting} />}
      </div>
    </div>
  );
}

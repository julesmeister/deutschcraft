'use client';

import { Dropdown } from './Dropdown';
import { DatePicker } from './DatePicker';
import { Select } from '../Select';
import { Task } from './types';
import { statusOptions, priorityOptions } from './constants';

interface NewTaskFormProps {
  groupId: string;
  taskData: {
    title: string;
    status: Task['status'];
    priority: Task['priority'];
    dueDate: string;
    assignees: string[];
    instructions?: string;
    minWords?: number;
    maxWords?: number;
    minParagraphs?: number;
    maxParagraphs?: number;
    totalPoints?: number;
    tone?: 'formell' | 'informell' | 'sachlich' | 'persönlich' | 'offiziell';
    perspective?: 'first-person' | 'second-person' | 'third-person';
    requireIntroduction?: boolean;
    requireConclusion?: boolean;
    requireExamples?: boolean;
  };
  showDetailsForm: boolean;
  onUpdateField: <K extends keyof typeof taskData>(field: K, value: typeof taskData[K]) => void;
  onToggleDetails: () => void;
  onCancel: () => void;
  onCreate: () => void;
}

export function NewTaskForm({
  groupId,
  taskData,
  showDetailsForm,
  onUpdateField,
  onToggleDetails,
  onCancel,
  onCreate,
}: NewTaskFormProps) {
  return (
    <div className="mt-4 border border-gray-200 rounded-lg transition-shadow duration-150">
      <table className="w-full">
        <tbody>
          <tr>
            {/* Drag Handle Space */}
            <td className="w-[40px] px-6 py-4"></td>

            {/* Checkbox Space */}
            <td className="w-[40px] px-6 py-4 text-2xl text-gray-400 overflow-visible">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4 -4" />
              </svg>
            </td>

            {/* Title */}
            <td className="w-[500px] px-6 py-4 overflow-visible">
              <input
                type="text"
                className="outline-0 font-semibold w-full bg-transparent text-gray-900 placeholder-gray-400"
                placeholder="Enter task name"
                value={taskData.title}
                onChange={(e) => onUpdateField('title', e.target.value)}
                autoFocus
              />
            </td>

            {/* Status */}
            <td className="w-[150px] px-6 py-4 overflow-visible relative">
              <Dropdown
                value={taskData.status}
                options={statusOptions}
                onChange={(value) => onUpdateField('status', value as Task['status'])}
                placeholder="Status"
              />
            </td>

            {/* Priority */}
            <td className="w-[150px] px-6 py-4 overflow-visible relative">
              <Dropdown
                value={taskData.priority}
                options={priorityOptions}
                onChange={(value) => onUpdateField('priority', value as Task['priority'])}
                placeholder="Priority"
              />
            </td>

            {/* Due Date */}
            <td className="w-[200px] px-6 py-4 overflow-visible relative">
              <DatePicker
                value={taskData.dueDate}
                onChange={(date) => onUpdateField('dueDate', date)}
              />
            </td>

            {/* Actions */}
            <td className="px-6 py-4 overflow-visible relative">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={onToggleDetails}
                  className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 rounded-xl px-3 py-2 text-sm font-bold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  Details
                </button>
                <button
                  onClick={onCancel}
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 h-10 rounded-xl px-3 py-2 text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onCreate}
                  className="inline-flex items-center bg-piku-purple-dark hover:bg-piku-purple-dark/90 text-white h-10 rounded-xl px-3 py-2 text-sm font-bold transition-colors"
                >
                  Create
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Expandable Details Section */}
      {showDetailsForm && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h4 className="font-bold text-gray-900 mb-4">Writing Criteria (Optional)</h4>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Instructions */}
            <div className="col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Instructions</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-piku-purple-dark focus:ring-1 focus:ring-piku-purple-dark"
                placeholder="Detailed instructions for the student..."
                rows={3}
                value={taskData.instructions || ''}
                onChange={(e) => onUpdateField('instructions', e.target.value)}
              />
            </div>

            {/* Word Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Min Words</label>
              <input
                type="number"
                className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                placeholder="e.g. 100"
                value={taskData.minWords || ''}
                onChange={(e) => onUpdateField('minWords', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Words</label>
              <input
                type="number"
                className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                placeholder="e.g. 500"
                value={taskData.maxWords || ''}
                onChange={(e) => onUpdateField('maxWords', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Points</label>
              <input
                type="number"
                className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                placeholder="e.g. 100"
                value={taskData.totalPoints || ''}
                onChange={(e) => onUpdateField('totalPoints', parseInt(e.target.value) || undefined)}
              />
            </div>

            {/* Paragraph Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Min Paragraphs</label>
              <input
                type="number"
                className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                placeholder="e.g. 3"
                value={taskData.minParagraphs || ''}
                onChange={(e) => onUpdateField('minParagraphs', parseInt(e.target.value) || undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Max Paragraphs</label>
              <input
                type="number"
                className="w-full h-12 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 font-semibold outline-none focus:border-piku-purple-dark focus:ring-2 focus:ring-piku-purple-dark focus:bg-white transition-all"
                placeholder="e.g. 5"
                value={taskData.maxParagraphs || ''}
                onChange={(e) => onUpdateField('maxParagraphs', parseInt(e.target.value) || undefined)}
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Schreibstil (Tone)</label>
              <Select
                options={[
                  { value: '', label: 'Any' },
                  { value: 'formell', label: 'Formell (Formal - Sie)' },
                  { value: 'informell', label: 'Informell (Informal - du)' },
                  { value: 'sachlich', label: 'Sachlich (Objective)' },
                  { value: 'persönlich', label: 'Persönlich (Personal)' },
                  { value: 'offiziell', label: 'Offiziell (Official)' },
                ]}
                value={taskData.tone || ''}
                onChange={(value) => onUpdateField('tone', value as any)}
                placeholder="Select tone..."
              />
            </div>

            {/* Perspective */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Perspective</label>
              <Select
                options={[
                  { value: '', label: 'Any' },
                  { value: 'first-person', label: 'First Person (I/We - Ich/Wir)' },
                  { value: 'second-person', label: 'Second Person (You - Du/Sie)' },
                  { value: 'third-person', label: 'Third Person (He/She - Er/Sie)' },
                ]}
                value={taskData.perspective || ''}
                onChange={(value) => onUpdateField('perspective', value as any)}
                placeholder="Select perspective..."
              />
            </div>
          </div>

          {/* Checkboxes for structure requirements */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-piku-purple-dark focus:ring-piku-purple-dark"
                checked={taskData.requireIntroduction || false}
                onChange={(e) => onUpdateField('requireIntroduction', e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">Require Introduction</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-piku-purple-dark focus:ring-piku-purple-dark"
                checked={taskData.requireConclusion || false}
                onChange={(e) => onUpdateField('requireConclusion', e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">Require Conclusion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-piku-purple-dark focus:ring-piku-purple-dark"
                checked={taskData.requireExamples || false}
                onChange={(e) => onUpdateField('requireExamples', e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">Require Examples</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

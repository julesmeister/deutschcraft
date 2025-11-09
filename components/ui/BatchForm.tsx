'use client';

import { useState } from 'react';
import { Dialog } from './Dialog';
import { FormField } from './FormField';
import { Input } from './Input';
import { Label } from './Label';
import { Select, SelectOption } from './Select';
import { CEFRLevel } from '@/lib/models';

interface BatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    currentLevel: CEFRLevel;
    startDate: number;
    endDate: number | null;
  }) => void;
  isLoading?: boolean;
}

export function BatchForm({ isOpen, onClose, onSubmit, isLoading = false }: BatchFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Default end date to 1 month from today
  const getDefaultEndDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  const [endDate, setEndDate] = useState(getDefaultEndDate());

  // Create options for the Select component
  const levelOptions: SelectOption[] = Object.values(CEFRLevel).map((level) => ({
    value: level,
    label: level,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      currentLevel,
      startDate: new Date(startDate).getTime(),
      endDate: endDate ? new Date(endDate).getTime() : null,
    });
    // Reset form
    setName('');
    setDescription('');
    setCurrentLevel(CEFRLevel.A1);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(getDefaultEndDate());
  };

  return (
    <Dialog open={isOpen} onClose={onClose} size="md">
      <div className="-mt-6 -mx-6 -mb-6">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-piku-cyan flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Create New Batch</h2>
              <p className="text-gray-400 text-sm">Set up a new student group</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Batch Name */}
          <FormField>
            <Label htmlFor="batch-name">Batch Name *</Label>
            <Input
              id="batch-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., German A1 - Morning Batch"
              required
            />
          </FormField>

          {/* Description */}
          <FormField>
            <Label htmlFor="batch-description">Description</Label>
            <textarea
              id="batch-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple focus:border-transparent"
              rows={3}
            />
          </FormField>

          {/* Current Level */}
          <FormField>
            <Label htmlFor="batch-level">Starting Level *</Label>
            <Select
              options={levelOptions}
              value={currentLevel}
              onChange={(value) => setCurrentLevel(value as CEFRLevel)}
              placeholder="Select CEFR level..."
            />
          </FormField>

          {/* Start Date */}
          <FormField>
            <Label htmlFor="batch-start-date">Start Date *</Label>
            <Input
              id="batch-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </FormField>

          {/* End Date */}
          <FormField>
            <Label htmlFor="batch-end-date">End Date (Optional)</Label>
            <Input
              id="batch-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </FormField>

          </form>
        </div>

        {/* Footer with Actions */}
        <div className="bg-gray-900 px-6 py-5 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-white">Note:</span> Students can be added to this batch later
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2.5 border-2 border-gray-600 text-gray-300 font-bold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-piku-cyan text-gray-900 font-bold rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

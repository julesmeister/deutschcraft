'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';
import { FormField } from './FormField';
import { Input } from './Input';
import { Label } from './Label';
import { Select, SelectOption } from './Select';
import { CEFRLevel, Batch } from '@/lib/models';

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
  initialData?: Batch;
  mode?: 'create' | 'edit';
}

export function BatchForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  mode = 'create',
}: BatchFormProps) {
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

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setCurrentLevel(initialData.currentLevel as CEFRLevel);
      setStartDate(new Date(initialData.startDate).toISOString().split('T')[0]);
      setEndDate(initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
    } else if (isOpen && mode === 'create') {
      // Reset to defaults for create mode
      setName('');
      setDescription('');
      setCurrentLevel(CEFRLevel.A1);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(getDefaultEndDate());
    }
  }, [isOpen, mode, initialData]);

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

  // Format date for display
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} size="md">
      <div className="-mt-6 -mx-6 -mb-6">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-piku-cyan flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mode === 'edit' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {mode === 'edit' ? 'Edit Batch' : 'Create New Batch'}
              </h2>
              <p className="text-gray-400 text-sm">
                {mode === 'edit' ? 'Update batch information' : 'Set up a new student group'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Batch Name - Full Width */}
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

            {/* Description - Full Width */}
            <FormField>
              <Label htmlFor="batch-description">Description</Label>
              <textarea
                id="batch-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple focus:border-transparent transition-all duration-150"
                rows={3}
              />
            </FormField>

            {/* Current Level - Full Width */}
            <FormField>
              <Label htmlFor="batch-level">Starting Level *</Label>
              <Select
                options={levelOptions}
                value={currentLevel}
                onChange={(value) => setCurrentLevel(value as CEFRLevel)}
                placeholder="Select CEFR level..."
              />
            </FormField>

            {/* Two Column Layout for Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField>
                <Label htmlFor="batch-start-date">Start *</Label>
                <div className="relative">
                  <input
                    id="batch-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple focus:border-transparent transition-all duration-150 text-transparent"
                    style={{
                      colorScheme: 'light',
                    }}
                  />
                  <div className="absolute inset-0 px-3 py-2 pointer-events-none flex items-center text-gray-900">
                    {formatDateForDisplay(startDate)}
                  </div>
                </div>
              </FormField>

              {/* End Date */}
              <FormField>
                <Label htmlFor="batch-end-date">End (Optional)</Label>
                <div className="relative">
                  <input
                    id="batch-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple focus:border-transparent transition-all duration-150 text-transparent"
                    style={{
                      colorScheme: 'light',
                    }}
                  />
                  <div className="absolute inset-0 px-3 py-2 pointer-events-none flex items-center text-gray-900">
                    {endDate ? formatDateForDisplay(endDate) : <span className="text-gray-400">Optional</span>}
                  </div>
                </div>
              </FormField>
            </div>

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
                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  mode === 'edit' ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

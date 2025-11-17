'use client';

import { useState } from 'react';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { Select, SelectOption } from '@/components/ui/Select';
import { SettingsFormField } from './SettingsFormField';
import { AlertDialog } from '@/components/ui/Dialog';

interface EnrollmentTabProps {
  onSubmit: (data: EnrollmentFormData) => void;
  isSaving?: boolean;
  onDeleteAccount?: () => void;
}

export interface EnrollmentFormData {
  desiredCefrLevel: CEFRLevel;
  gcashReferenceNumber: string;
  gcashAmount: string;
}

export function EnrollmentTab({ onSubmit, isSaving = false, onDeleteAccount }: EnrollmentTabProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    desiredCefrLevel: CEFRLevel.A1,
    gcashReferenceNumber: '',
    gcashAmount: '',
  });

  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // CEFR Level options
  const cefrOptions: SelectOption[] = Object.values(CEFRLevel).map((level) => ({
    value: level,
    label: CEFRLevelInfo[level].displayName,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.gcashReferenceNumber.trim()) {
      setValidationMessage('Please enter your GCash reference number to proceed with enrollment.');
      setShowValidationDialog(true);
      return;
    }

    const amount = parseFloat(formData.gcashAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationMessage('Please enter a valid payment amount greater than zero.');
      setShowValidationDialog(true);
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Student Enrollment</h2>
      <p className="text-gray-600 mb-8">Complete your enrollment to start learning German with Testmanship</p>

      {/* Validation Dialog */}
      <AlertDialog
        open={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        title="Validation Error"
        message={validationMessage}
        buttonText="Got it"
      />

      <form onSubmit={handleSubmit}>
        {/* CEFR Level Selection */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-900 mb-2">
            Desired CEFR Level <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.desiredCefrLevel}
            onChange={(value) => setFormData({ ...formData, desiredCefrLevel: value as CEFRLevel })}
            options={cefrOptions}
            placeholder="Select your desired CEFR level"
          />
          <p className="mt-2 text-xs text-gray-500">
            Select the CEFR level you want to study. Your teacher will review and approve your selection.
          </p>
        </div>

        {/* Payment Information Header */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Information</h3>
          <p className="text-sm text-gray-600">Enter your GCash payment details below</p>
        </div>

        {/* GCash Reference Number */}
        <SettingsFormField
          label="GCash Reference Number"
          type="text"
          value={formData.gcashReferenceNumber}
          placeholder="Enter your GCash reference number"
          onChange={(value) => setFormData({ ...formData, gcashReferenceNumber: value })}
        />

        {/* Payment Amount */}
        <SettingsFormField
          label="Payment Amount (₱)"
          type="number"
          value={formData.gcashAmount}
          placeholder="0.00"
          onChange={(value) => setFormData({ ...formData, gcashAmount: value })}
        />

        {/* What's Next - Card Style */}
        <div className="bg-white border-2 border-piku-purple/20 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="text-3xl">📋</span>
            <span>What happens next?</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                number: 1,
                title: 'Payment Verification',
                description: 'Your teacher will verify your payment details',
                color: 'blue',
              },
              {
                number: 2,
                title: 'Level Review',
                description: 'Your CEFR level selection will be reviewed',
                color: 'emerald',
              },
              {
                number: 3,
                title: 'Email Notification',
                description: "You'll receive an email once approved",
                color: 'amber',
              },
              {
                number: 4,
                title: 'Full Access',
                description: 'Student dashboard access will be granted',
                color: 'purple',
              },
            ].map((step) => {
              const colorMap: Record<string, { bg: string; text: string }> = {
                blue: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
                emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
                amber: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
                purple: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
              };
              const colors = colorMap[step.color];

              return (
                <div key={step.number} className="flex gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} font-bold`}
                  >
                    {step.number}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-piku-purple to-pastel-ocean text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Enrollment'
            )}
          </button>
        </div>
      </form>
    </>
  );
}

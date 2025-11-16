/**
 * WritingWorkspace Component
 * Reusable 2-column layout: Writing field (left) | Instructions/History tabs (right)
 * Clean email-composer style with minimal borders
 */

import { ReactNode, useState } from 'react';
import { WritingAttemptBanner } from './WritingAttemptBanner';

interface WritingWorkspaceProps {
  // Left side - Writing field
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  topIndicator?: ReactNode; // Optional indicator above textarea (e.g., word count)
  additionalFields?: ReactNode; // Optional fields above main textarea (e.g., To, Subject for emails)

  // Right side - Instructions and History
  instructions: ReactNode;
  attemptCount?: number; // Number of previous attempts on this exercise
  attemptHistory?: ReactNode; // Attempt history component to show in History tab

  // Optional
  autoFocus?: boolean;
  readOnly?: boolean; // NEW: For viewing historical attempts
  viewingAttempt?: { attemptNumber: number; status: string }; // NEW: Info about the attempt being viewed
}

export function WritingWorkspace({
  value,
  onChange,
  placeholder,
  topIndicator,
  additionalFields,
  instructions,
  attemptCount,
  attemptHistory,
  autoFocus = true,
  readOnly = false,
  viewingAttempt,
}: WritingWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'instructions' | 'history'>('write');

  return (
    <div className="bg-white min-h-[600px] flex flex-col lg:flex-row">
      {/* Mobile/Tablet: Tab Navigation */}
      <div className="flex border-b border-gray-200 lg:hidden">
        <TabButton
          label="Write"
          active={activeTab === 'write'}
          onClick={() => setActiveTab('write')}
        />
        <TabButton
          label="Instructions"
          active={activeTab === 'instructions'}
          onClick={() => setActiveTab('instructions')}
        />
        <TabButton
          label="History"
          active={activeTab === 'history'}
          count={attemptCount}
          onClick={() => setActiveTab('history')}
        />
      </div>

      {/* LEFT: Writing Field */}
      <div className={`flex-1 flex flex-col ${activeTab !== 'write' ? 'hidden lg:flex' : ''}`}>
        {/* Viewing Attempt Banner */}
        {readOnly && viewingAttempt && (
          <WritingAttemptBanner
            attemptNumber={viewingAttempt.attemptNumber}
            status={viewingAttempt.status}
          />
        )}

        <div className="flex-1 p-4 md:p-8 flex flex-col">

        {/* Optional Top Indicator (e.g., word count) */}
        {topIndicator && (
          <div className="mb-4">
            {topIndicator}
          </div>
        )}

        {/* Optional Additional Fields (e.g., email To/Subject) */}
        {additionalFields && (
          <div className="mb-6 space-y-4">
            {additionalFields}
          </div>
        )}

        {/* Main Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`flex-1 w-full bg-transparent border-none outline-none resize-none text-lg md:text-xl lg:text-2xl leading-relaxed ${
            readOnly
              ? 'text-gray-700 cursor-default'
              : 'text-gray-900 placeholder-gray-400'
          }`}
          style={{
            lineHeight: '1.6',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
          }}
          autoFocus={!readOnly && autoFocus}
        />
        </div>
      </div>

      {/* SEPARATOR - Desktop only */}
      <div className="hidden lg:block w-px bg-gray-200" />

      {/* RIGHT: Instructions/History Panel */}
      <div className={`flex flex-col lg:w-[400px] ${activeTab === 'write' ? 'hidden lg:flex' : ''}`}>
        {/* Tabs Navigation - Desktop only */}
        <div className="hidden lg:flex border-b border-gray-200">
          <TabButton
            label="Instructions"
            active={activeTab === 'instructions'}
            onClick={() => setActiveTab('instructions')}
          />
          <TabButton
            label="History"
            active={activeTab === 'history'}
            count={attemptCount}
            onClick={() => setActiveTab('history')}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* Mobile/Tablet: Show based on activeTab */}
          <div className="lg:hidden">
            {activeTab === 'instructions' && instructions}
            {activeTab === 'history' && (
              attemptHistory || (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm">No previous attempts yet.</p>
                  <p className="text-xs mt-1">Your attempt history will appear here.</p>
                </div>
              )
            )}
          </div>

          {/* Desktop: Show based on desktop tabs */}
          <div className="hidden lg:block">
            {activeTab === 'instructions' ? (
              instructions
            ) : (
              attemptHistory || (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm">No previous attempts yet.</p>
                  <p className="text-xs mt-1">Your attempt history will appear here.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface TabButtonProps {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}

function TabButton({ label, active, count, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-1 text-xs text-gray-500">({count})</span>
      )}
    </button>
  );
}

/**
 * Helper component for email-style fields (To, Subject, etc.)
 * Borderless with subtle bottom border
 */
interface EmailFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function EmailField({ label, value, onChange, placeholder }: EmailFieldProps) {
  return (
    <div className="border-b border-gray-200 pb-2">
      <label className="text-sm text-gray-500 mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none text-lg text-gray-900 placeholder-gray-400"
      />
    </div>
  );
}

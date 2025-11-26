/**
 * GradingTabs Component
 * Tabs for grading panel and revision history
 */

import { ReactNode } from 'react';

interface GradingTabsProps {
  activeTab: 'grading' | 'history';
  onTabChange: (tab: 'grading' | 'history') => void;
  historyCount?: number;
  gradingPanel: ReactNode;
  historyPanel: ReactNode;
}

export function GradingTabs({
  activeTab,
  onTabChange,
  historyCount = 0,
  gradingPanel,
  historyPanel,
}: GradingTabsProps) {
  return (
    <div className="w-[480px] flex flex-col">
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => onTabChange('grading')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'grading'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Grading
        </button>
        <button
          onClick={() => onTabChange('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span>History</span>
          {historyCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
              {historyCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'grading' && (
          <div className="p-6">
            {gradingPanel}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            {historyPanel}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TwoColumnWorkspace Component
 * Reusable 2-column responsive layout with mobile tabs
 * Used by WritingWorkspace and FeedbackWorkspace
 */

import { ReactNode, useState } from 'react';

type TabOption = 'left' | 'right' | 'rightSecondary';

interface TwoColumnWorkspaceProps {
  // Left panel
  leftPanel: ReactNode;
  leftLabel?: string;

  // Right panel (primary)
  rightPanel: ReactNode;
  rightLabel?: string;

  // Right panel (secondary, optional - for Instructions/History split)
  rightPanelSecondary?: ReactNode;
  rightLabelSecondary?: string;

  rightPanelWidth?: string; // e.g., 'lg:w-[400px]'

  // Mobile behavior
  defaultActiveTab?: TabOption;
  showMobileTabs?: boolean;

  // Optional count badge for tabs (e.g., attempt count)
  rightCount?: number;
  rightSecondaryCount?: number;

  // Desktop right panel tabs (show tabs on desktop for right panel)
  showDesktopRightTabs?: boolean;
}

export function TwoColumnWorkspace({
  leftPanel,
  leftLabel = 'Content',
  rightPanel,
  rightLabel = 'Panel',
  rightPanelSecondary,
  rightLabelSecondary = 'Secondary',
  rightPanelWidth = 'lg:w-[400px]',
  defaultActiveTab = 'left',
  showMobileTabs = true,
  rightCount,
  rightSecondaryCount,
  showDesktopRightTabs = false,
}: TwoColumnWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabOption>(defaultActiveTab);

  const hasSecondaryPanel = !!rightPanelSecondary;

  return (
    <div className="bg-white flex flex-col lg:flex-row">
      {/* Mobile/Tablet: Tab Navigation */}
      {showMobileTabs && (
        <div className="flex border-b border-gray-200 lg:hidden">
          <TabButton
            label={leftLabel}
            active={activeTab === 'left'}
            onClick={() => setActiveTab('left')}
          />
          <TabButton
            label={rightLabel}
            active={activeTab === 'right'}
            onClick={() => setActiveTab('right')}
            count={rightCount}
          />
          {hasSecondaryPanel && (
            <TabButton
              label={rightLabelSecondary}
              active={activeTab === 'rightSecondary'}
              onClick={() => setActiveTab('rightSecondary')}
              count={rightSecondaryCount}
            />
          )}
        </div>
      )}

      {/* LEFT PANEL */}
      <div className={`flex-1 flex flex-col ${activeTab !== 'left' ? 'hidden lg:flex' : ''}`}>
        {leftPanel}
      </div>

      {/* SEPARATOR - Desktop only */}
      <div className="hidden lg:block w-px bg-gray-200" />

      {/* RIGHT PANEL */}
      <div className={`flex flex-col ${rightPanelWidth} ${activeTab === 'left' ? 'hidden lg:flex' : ''}`}>
        {/* Desktop Tabs - Only if secondary panel exists and showDesktopRightTabs is true */}
        {hasSecondaryPanel && showDesktopRightTabs && (
          <div className="hidden lg:flex border-b border-gray-200">
            <TabButton
              label={rightLabel}
              active={activeTab === 'right'}
              onClick={() => setActiveTab('right')}
              count={rightCount}
            />
            <TabButton
              label={rightLabelSecondary}
              active={activeTab === 'rightSecondary'}
              onClick={() => setActiveTab('rightSecondary')}
              count={rightSecondaryCount}
            />
          </div>
        )}

        {/* Right Panel Content */}
        <div className="flex-1">
          {/* Mobile/Tablet: Show based on activeTab */}
          <div className="lg:hidden h-full">
            {activeTab === 'right' && rightPanel}
            {activeTab === 'rightSecondary' && rightPanelSecondary}
          </div>

          {/* Desktop: Show based on activeTab when desktop tabs are enabled */}
          {hasSecondaryPanel && showDesktopRightTabs ? (
            <div className="hidden lg:block h-full">
              {activeTab === 'right' && rightPanel}
              {activeTab === 'rightSecondary' && rightPanelSecondary}
            </div>
          ) : (
            /* Desktop: Always show right panel when no desktop tabs */
            <div className="hidden lg:block h-full">
              {rightPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

function TabButton({ label, active, onClick, count }: TabButtonProps) {
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

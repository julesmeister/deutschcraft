/**
 * TabBar Usage Example
 * Demonstrates how to use the TabBar component
 */

'use client';

import { useState } from 'react';
import { TabBar, TabItem } from './TabBar';
import {
  GlobeIcon,
  ShieldCheckIcon,
  ShieldSlashIcon,
  ShieldIcon,
  CodeIcon,
  RadarIcon,
} from './TabIcons';

export function TabBarExample() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs: TabItem[] = [
    {
      id: 'all',
      label: 'All Traffic',
      icon: <GlobeIcon />,
      value: '-',
    },
    {
      id: 'allowed',
      label: 'Allowed',
      icon: <ShieldCheckIcon />,
      value: '-',
    },
    {
      id: 'denied',
      label: 'Denied',
      icon: <ShieldSlashIcon />,
      value: '-',
    },
    {
      id: 'challenged',
      label: 'Challenged',
      icon: <ShieldIcon />,
      value: '-',
    },
    {
      id: 'logged',
      label: 'Logged',
      icon: <CodeIcon />,
      value: '-',
    },
    {
      id: 'rate-limited',
      label: 'Rate Limited',
      icon: <RadarIcon />,
      value: '-',
    },
  ];

  return (
    <div className="w-full">
      <TabBar
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content Area */}
      <div className="flex-1 px-4 pb-4 pt-8">
        <div className="w-full h-full">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-neutral-50 h-60">
            <p className="text-neutral-900 text-sm font-medium leading-5">
              {tabs.find(t => t.id === activeTab)?.label}
            </p>
            <p className="text-sm leading-5 max-w-sm text-zinc-500">
              Content for {activeTab} tab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example with real data
export function TabBarWithData() {
  const [activeTab, setActiveTab] = useState('all');

  const stats = {
    all: 12543,
    allowed: 10234,
    denied: 1543,
    challenged: 432,
    logged: 234,
    rateLimited: 100,
  };

  const tabs: TabItem[] = [
    {
      id: 'all',
      label: 'All Traffic',
      icon: <GlobeIcon />,
      value: stats.all.toLocaleString(),
    },
    {
      id: 'allowed',
      label: 'Allowed',
      icon: <ShieldCheckIcon />,
      value: stats.allowed.toLocaleString(),
    },
    {
      id: 'denied',
      label: 'Denied',
      icon: <ShieldSlashIcon />,
      value: stats.denied.toLocaleString(),
    },
    {
      id: 'challenged',
      label: 'Challenged',
      icon: <ShieldIcon />,
      value: stats.challenged.toLocaleString(),
    },
    {
      id: 'logged',
      label: 'Logged',
      icon: <CodeIcon />,
      value: stats.logged.toLocaleString(),
    },
    {
      id: 'rateLimited',
      label: 'Rate Limited',
      icon: <RadarIcon />,
      value: stats.rateLimited.toLocaleString(),
    },
  ];

  return (
    <div className="w-full">
      <TabBar
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content Area */}
      <div className="flex-1 px-4 pb-4 pt-8">
        <div className="w-full h-full">
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-neutral-50 h-60">
            <p className="text-neutral-900 text-sm font-medium leading-5">
              {tabs.find(t => t.id === activeTab)?.label}
            </p>
            <p className="text-sm leading-5 max-w-sm text-zinc-500">
              Showing {tabs.find(t => t.id === activeTab)?.value} records
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TabBarExample;

/**
 * CompactButtonDropdown - Usage Examples
 *
 * A flexible, reusable button dropdown component inspired by Semantic UI
 * but built with pure React + Tailwind for React 19 compatibility.
 */

'use client';

import { useState } from 'react';
import { CompactButtonDropdown, DropdownBadge, DropdownOption, DropdownGroup } from './CompactButtonDropdown';

export function CompactButtonDropdownExamples() {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  // Example 1: Simple dropdown with flat options
  const simpleOptions: DropdownOption[] = [
    { value: 'all', label: 'All Posts' },
    { value: 'unread', label: 'Unread' },
    { value: 'starred', label: 'Starred' },
    { value: 'archived', label: 'Archived' },
  ];

  // Example 2: Tag filter with colored badges and search
  const tagGroups: DropdownGroup[] = [
    {
      title: 'Tag Label',
      icon: '🏷️',
      options: [
        {
          value: 'important',
          label: 'Important',
          icon: <DropdownBadge color="#dc2626" />,
        },
        {
          value: 'announcement',
          label: 'Announcement',
          icon: <DropdownBadge color="#0284c7" />,
        },
        {
          value: 'cannot-fix',
          label: 'Cannot Fix',
          icon: <DropdownBadge color="#18181b" />,
        },
        {
          value: 'news',
          label: 'News',
          icon: <DropdownBadge color="#c026d3" />,
        },
        {
          value: 'enhancement',
          label: 'Enhancement',
          icon: <DropdownBadge color="#f97316" />,
        },
        {
          value: 'declined',
          label: 'Change Declined',
          icon: <DropdownBadge color="#d1d5db" />,
        },
        {
          value: 'off-topic',
          label: 'Off Topic',
          icon: <DropdownBadge color="#eab308" />,
        },
        {
          value: 'interesting',
          label: 'Interesting',
          icon: <DropdownBadge color="#ec4899" />,
        },
        {
          value: 'discussion',
          label: 'Discussion',
          icon: <DropdownBadge color="#16a34a" />,
        },
      ],
    },
  ];

  // Example 3: CEFR level selector
  const levelOptions: DropdownOption[] = [
    { value: 'A1', label: 'A1 - Beginner', icon: '🟢' },
    { value: 'A2', label: 'A2 - Elementary', icon: '🟢' },
    { value: 'B1', label: 'B1 - Intermediate', icon: '🟡' },
    { value: 'B2', label: 'B2 - Upper Intermediate', icon: '🟡' },
    { value: 'C1', label: 'C1 - Advanced', icon: '🔴' },
    { value: 'C2', label: 'C2 - Proficiency', icon: '🔴' },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">CompactButtonDropdown Examples</h1>

      {/* Example 1: Simple Dropdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">1. Simple Dropdown</h2>
        <CompactButtonDropdown
          label="Filter Posts"
          icon={<span>📧</span>}
          options={simpleOptions}
          value={selectedTag}
          onChange={(value) => setSelectedTag(value as string)}
        />
        <p className="mt-4 text-sm text-gray-600">Selected: {selectedTag || 'None'}</p>
      </div>

      {/* Example 2: Searchable with Groups and Tags */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">2. Searchable Tag Filter (Multiple)</h2>
        <CompactButtonDropdown
          label="Filter Posts"
          icon={<span>🏷️</span>}
          searchable
          searchPlaceholder="Search tags..."
          groups={tagGroups}
          value={selectedTags}
          multiple
          onChange={(value) => setSelectedTags(value as string[])}
        />
        <p className="mt-4 text-sm text-gray-600">
          Selected: {selectedTags.length > 0 ? selectedTags.join(', ') : 'None'}
        </p>
      </div>

      {/* Example 3: CEFR Level Selector */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">3. Level Selector</h2>
        <CompactButtonDropdown
          label="Select Level"
          icon={<span>📚</span>}
          options={levelOptions}
          value={selectedLevel}
          onChange={(value) => setSelectedLevel(value as string)}
        />
        <p className="mt-4 text-sm text-gray-600">Selected: {selectedLevel || 'None'}</p>
      </div>

      {/* Example 4: Disabled State */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">4. Disabled Dropdown</h2>
        <CompactButtonDropdown
          label="Filter Posts"
          icon={<span>🚫</span>}
          options={simpleOptions}
          disabled
        />
      </div>

      {/* Example 5: Custom Styling */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">5. Custom Styled Button</h2>
        <CompactButtonDropdown
          label="Premium Filter"
          icon={<span>✨</span>}
          options={simpleOptions}
          buttonClassName="!bg-purple-500 !text-white hover:!bg-purple-600"
        />
      </div>

      {/* Props Documentation */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Props</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 font-semibold">Prop</th>
                <th className="text-left p-2 font-semibold">Type</th>
                <th className="text-left p-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2 font-mono text-xs">label</td>
                <td className="p-2 text-gray-600">string</td>
                <td className="p-2">Button text</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">icon</td>
                <td className="p-2 text-gray-600">ReactNode</td>
                <td className="p-2">Icon on left side (emoji, SVG, etc.)</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">searchable</td>
                <td className="p-2 text-gray-600">boolean</td>
                <td className="p-2">Enable search input</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">searchPlaceholder</td>
                <td className="p-2 text-gray-600">string</td>
                <td className="p-2">Placeholder text for search</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">options</td>
                <td className="p-2 text-gray-600">DropdownOption[]</td>
                <td className="p-2">Flat list of options</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">groups</td>
                <td className="p-2 text-gray-600">DropdownGroup[]</td>
                <td className="p-2">Grouped options with headers</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">value</td>
                <td className="p-2 text-gray-600">string | string[]</td>
                <td className="p-2">Selected value(s)</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">multiple</td>
                <td className="p-2 text-gray-600">boolean</td>
                <td className="p-2">Allow multiple selections</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">onChange</td>
                <td className="p-2 text-gray-600">function</td>
                <td className="p-2">Callback when selection changes</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">disabled</td>
                <td className="p-2 text-gray-600">boolean</td>
                <td className="p-2">Disable the dropdown</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">buttonClassName</td>
                <td className="p-2 text-gray-600">string</td>
                <td className="p-2">Custom button styles (use !important with Tailwind)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

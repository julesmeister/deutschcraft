/**
 * VerticalMenu - Usage Examples
 *
 * Semantic UI style vertical navigation menu
 */

'use client';

import { useState } from 'react';
import { VerticalMenu, VerticalMenuWithGroups, MenuItem } from './VerticalMenu';

export function VerticalMenuExamples() {
  const [activeItem, setActiveItem] = useState('home');
  const [activeMailItem, setActiveMailItem] = useState('inbox');

  // Example 1: Simple vertical menu
  const simpleItems: MenuItem[] = [
    { label: 'Home', value: 'home', href: '/' },
    { label: 'About', value: 'about', href: '/about' },
    { label: 'Services', value: 'services', href: '/services' },
    { label: 'Contact', value: 'contact', href: '/contact' },
  ];

  // Example 2: Menu with submenu (like Messages)
  const messagesItems: MenuItem[] = [
    { label: 'Home', value: 'home', href: '/' },
    {
      label: 'Messages',
      value: 'messages',
      submenu: [
        { label: 'Inbox', value: 'inbox' },
        { label: 'Starred', value: 'starred' },
        { label: 'Sent Mail', value: 'sent' },
        { label: 'Drafts', value: 'drafts', badge: 143 },
      ],
    },
    { label: 'Browse', value: 'browse' },
    { label: 'Help', value: 'help' },
  ];

  // Example 3: Email menu with dividers
  const emailGroups = [
    {
      items: [{ label: 'Home', value: 'home' }],
    },
    {
      items: [
        { label: 'Inbox', value: 'inbox' },
        { label: 'Starred', value: 'starred' },
        { label: 'Sent Mail', value: 'sent' },
        { label: 'Drafts', value: 'drafts', badge: 143 },
      ],
    },
    {
      items: [
        { label: 'Spam', value: 'spam', badge: 1009 },
        { label: 'Trash', value: 'trash' },
      ],
    },
  ];

  // Example 4: Teacher Dashboard Menu
  const teacherMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      value: 'dashboard',
      icon: '📊',
      href: '/dashboard/teacher',
    },
    {
      label: 'Students',
      value: 'students',
      icon: '👥',
      submenu: [
        { label: 'All Students', value: 'all-students', href: '/dashboard/teacher/students' },
        { label: 'Add Student', value: 'add-student' },
        { label: 'Import CSV', value: 'import' },
      ],
    },
    {
      label: 'Batches',
      value: 'batches',
      icon: '📚',
      href: '/dashboard/teacher/batches',
    },
    {
      label: 'Pricing',
      value: 'pricing',
      icon: '💰',
      href: '/dashboard/teacher/pricing',
    },
    {
      label: 'Settings',
      value: 'settings',
      icon: '⚙️',
      href: '/settings',
    },
  ];

  // Example 5: Student Level Menu
  const levelMenuItems: MenuItem[] = [
    { label: 'A1 - Beginner', value: 'A1', icon: '🟢' },
    { label: 'A2 - Elementary', value: 'A2', icon: '🟢' },
    { label: 'B1 - Intermediate', value: 'B1', icon: '🟡' },
    { label: 'B2 - Upper Intermediate', value: 'B2', icon: '🟡' },
    { label: 'C1 - Advanced', value: 'C1', icon: '🔴' },
    { label: 'C2 - Proficiency', value: 'C2', icon: '🔴' },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">VerticalMenu Examples</h1>

      {/* Example 1: Simple Menu */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">1. Simple Navigation Menu</h2>
        <VerticalMenu
          items={simpleItems}
          activeValue={activeItem}
          onItemClick={setActiveItem}
        />
      </div>

      {/* Example 2: Menu with Submenu */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">2. Menu with Submenu (Messages)</h2>
        <VerticalMenu
          items={messagesItems}
          activeValue={activeMailItem}
          onItemClick={setActiveMailItem}
        />
        <p className="mt-4 text-sm text-gray-600">
          Active: {activeMailItem}
        </p>
      </div>

      {/* Example 3: Menu with Groups & Dividers */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">3. Email Menu with Dividers</h2>
        <VerticalMenuWithGroups
          groups={emailGroups}
          activeValue={activeMailItem}
          onItemClick={setActiveMailItem}
        />
      </div>

      {/* Example 4: Teacher Dashboard Menu */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">4. Teacher Dashboard Menu</h2>
        <VerticalMenu
          items={teacherMenuItems}
          activeValue={activeItem}
          onItemClick={setActiveItem}
        />
      </div>

      {/* Example 5: Compact Level Selector */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">5. CEFR Level Menu</h2>
        <VerticalMenu
          items={levelMenuItems}
          activeValue={activeItem}
          onItemClick={setActiveItem}
          width="w-64"
        />
      </div>

      {/* Example 6: In a Dropdown Context */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">6. As Dropdown Content</h2>
        <div className="relative inline-block">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Open Menu ▼
          </button>
          <div className="absolute left-0 mt-2 z-10">
            <VerticalMenu
              items={simpleItems}
              activeValue={activeItem}
              onItemClick={(value) => {
                setActiveItem(value);
                // Close dropdown logic here
              }}
              width="w-48"
            />
          </div>
        </div>
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
                <td className="p-2 font-mono text-xs">items</td>
                <td className="p-2 text-gray-600">MenuItem[]</td>
                <td className="p-2">Array of menu items</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">activeValue</td>
                <td className="p-2 text-gray-600">string</td>
                <td className="p-2">Currently selected item value</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">onItemClick</td>
                <td className="p-2 text-gray-600">function</td>
                <td className="p-2">Callback when item is clicked</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">width</td>
                <td className="p-2 text-gray-600">string</td>
                <td className="p-2">Tailwind width class (default: w-52)</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">className</td>
                <td className="p-2 text-gray-600">string</td>
                <td className="p-2">Additional CSS classes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">MenuItem Interface</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 font-semibold">Property</th>
                <th className="text-left p-2 font-semibold">Type</th>
                <th className="text-left p-2 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-2 font-mono text-xs">label</td>
                <td className="p-2 text-gray-600">string</td>
                <td className="p-2">Display text</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">value</td>
                <td className="p-2 text-gray-600">string</td>
                <td className="p-2">Unique identifier</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">href</td>
                <td className="p-2 text-gray-600">string (optional)</td>
                <td className="p-2">Next.js Link href</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">icon</td>
                <td className="p-2 text-gray-600">ReactNode (optional)</td>
                <td className="p-2">Icon element (emoji/SVG)</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">badge</td>
                <td className="p-2 text-gray-600">string | number (optional)</td>
                <td className="p-2">Badge/count display</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">submenu</td>
                <td className="p-2 text-gray-600">MenuItem[] (optional)</td>
                <td className="p-2">Nested menu items</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">onClick</td>
                <td className="p-2 text-gray-600">function (optional)</td>
                <td className="p-2">Custom click handler</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

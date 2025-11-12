/**
 * CEFRLevelSelector Examples
 * Demonstrates all color schemes and configurations
 */

'use client';

import { useState } from 'react';
import { CEFRLevel } from '@/lib/models/cefr';
import { CEFRLevelSelector } from './CEFRLevelSelector';

export function CEFRLevelSelectorExamples() {
  const [level1, setLevel1] = useState<CEFRLevel>(CEFRLevel.A1);
  const [level2, setLevel2] = useState<CEFRLevel>(CEFRLevel.B1);
  const [level3, setLevel3] = useState<CEFRLevel>(CEFRLevel.A2);
  const [level4, setLevel4] = useState<CEFRLevel>(CEFRLevel.C1);
  const [level5, setLevel5] = useState<CEFRLevel>(CEFRLevel.B2);

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">CEFR Level Selector - Color Schemes</h1>

        {/* Default Color Scheme */}
        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Default (Rainbow)</h2>
          <p className="text-gray-600 mb-6">
            Blue → Emerald → Amber → Purple → Pink → Indigo
          </p>
          <CEFRLevelSelector
            selectedLevel={level1}
            onLevelChange={setLevel1}
            colorScheme="default"
            showDescription={true}
          />
          <p className="mt-4 text-sm text-gray-500">
            Selected: <span className="font-bold">{level1}</span>
          </p>
        </div>

        {/* Warm Color Scheme */}
        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Warm</h2>
          <p className="text-gray-600 mb-6">
            Orange → Amber → Yellow → Red → Rose → Pink
          </p>
          <CEFRLevelSelector
            selectedLevel={level2}
            onLevelChange={setLevel2}
            colorScheme="warm"
            showDescription={true}
          />
          <p className="mt-4 text-sm text-gray-500">
            Selected: <span className="font-bold">{level2}</span>
          </p>
        </div>

        {/* Cool Color Scheme */}
        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Cool</h2>
          <p className="text-gray-600 mb-6">
            Cyan → Teal → Sky → Blue → Indigo → Violet
          </p>
          <CEFRLevelSelector
            selectedLevel={level3}
            onLevelChange={setLevel3}
            colorScheme="cool"
            showDescription={true}
          />
          <p className="mt-4 text-sm text-gray-500">
            Selected: <span className="font-bold">{level3}</span>
          </p>
        </div>

        {/* Vibrant Color Scheme */}
        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Vibrant</h2>
          <p className="text-gray-600 mb-6">
            Fuchsia → Purple → Pink → Rose → Orange → Amber
          </p>
          <CEFRLevelSelector
            selectedLevel={level4}
            onLevelChange={setLevel4}
            colorScheme="vibrant"
            showDescription={true}
          />
          <p className="mt-4 text-sm text-gray-500">
            Selected: <span className="font-bold">{level4}</span>
          </p>
        </div>

        {/* Professional Color Scheme */}
        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Professional (Monochrome)</h2>
          <p className="text-gray-600 mb-6">
            Slate → Gray → Zinc → Neutral → Stone → Slate (dark)
          </p>
          <CEFRLevelSelector
            selectedLevel={level5}
            onLevelChange={setLevel5}
            colorScheme="professional"
            showDescription={true}
          />
          <p className="mt-4 text-sm text-gray-500">
            Selected: <span className="font-bold">{level5}</span>
          </p>
        </div>

        {/* Without Descriptions */}
        <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Compact (No Descriptions)</h2>
          <p className="text-gray-600 mb-6">
            Set <code className="bg-gray-100 px-2 py-1 rounded">showDescription={false}</code> for a more compact look
          </p>
          <CEFRLevelSelector
            selectedLevel={level1}
            onLevelChange={setLevel1}
            colorScheme="default"
            showDescription={false}
          />
        </div>

        {/* Usage Example */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Usage</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { CEFRLevelSelector } from '@/components/ui/CEFRLevelSelector';
import { CEFRLevel } from '@/lib/models/cefr';
import { useState } from 'react';

function MyComponent() {
  const [level, setLevel] = useState<CEFRLevel>(CEFRLevel.A1);

  return (
    <CEFRLevelSelector
      selectedLevel={level}
      onLevelChange={setLevel}
      colorScheme="default" // or "warm", "cool", "vibrant", "professional"
      showDescription={true}
      className="mb-8"
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

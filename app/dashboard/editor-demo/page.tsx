'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export default function EditorDemoPage() {
  const [content, setContent] = useState(`
    <p>Make a brew a right royal knees up and we all like figgy pudding a comely wench gutted its nicked pulled out the eating irons, ask your mother if on goggle box toad in the whole Sherlock rather, ar kid pennyboy naff superb pezzy little.</p>
    <ul>
      <li><p>Scally utter shambles blighty squirrel numbskull rumpy pumpy apple and pears bow ties are cool</p></li>
      <li><p>pompous nosh have a butcher at this flabbergasted a right toff black cab jolly good made a pigs ear of it</p></li>
      <li><p>Roast beef conked him one on the nose had a barney with the inlaws beefeater is she avin a laugh supper, gobsmacked argy-bargy challenge you to a duel</p></li>
      <li><p>whizz air one dirty linen chav not some sort of dosshouse.</p></li>
    </ul>
  `);

  const [description, setDescription] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-black text-gray-900">Rich Text Editor Demo ✍️</h1>
          <p className="text-gray-600 mt-1">Test the rich text editor component</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Example 1: Pre-populated Content</h2>

          <RichTextEditor
            label="Content"
            value={content}
            onChange={(html) => setContent(html)}
            placeholder="Start writing..."
          />

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">Output HTML:</h3>
            <pre className="text-xs text-gray-600 overflow-auto max-h-[200px]">
              {content}
            </pre>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Example 2: Empty Editor</h2>

          <RichTextEditor
            label="Description"
            value={description}
            onChange={(html) => setDescription(html)}
            placeholder="Write your description here..."
            maxHeight="400px"
          />

          <div className="flex justify-end mt-6">
            <button className="px-5 py-3 h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors">
              Save Content
            </button>
          </div>
        </div>

        {/* Feature List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Supported Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Text Formatting</p>
                <p className="text-sm text-gray-600">Bold, italic, strikethrough, inline code</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Headings</p>
                <p className="text-sm text-gray-600">H1 through H6 with dropdown selector</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Lists</p>
                <p className="text-sm text-gray-600">Bullet lists and ordered lists</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Block Elements</p>
                <p className="text-sm text-gray-600">Blockquotes, code blocks, horizontal rules</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

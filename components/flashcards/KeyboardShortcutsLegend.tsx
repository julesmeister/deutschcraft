'use client';

export function KeyboardShortcutsLegend() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="text-sm font-bold text-gray-900 mb-2">⌨️ Keyboard Shortcuts</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
        <div>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Space</kbd> Flip card
        </div>
        <div>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">1</kbd> Forgotten
        </div>
        <div>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">2</kbd> Hard
        </div>
        <div>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">3</kbd> Good
        </div>
        <div>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">4</kbd> Easy
        </div>
        <div>
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">← →</kbd> Navigate
        </div>
      </div>
    </div>
  );
}

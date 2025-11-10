'use client';

export function KeyboardShortcutsLegend() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="text-sm font-bold text-gray-900 mb-3">⌨️ Keyboard Shortcuts</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Space</kbd>
          <span>Flip card</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">1</kbd>
          <span>Forgotten</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">2</kbd>
          <span>Hard</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">3</kbd>
          <span>Good</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">4</kbd>
          <span>Easy</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">← →</kbd>
          <span>Navigate</span>
        </div>
      </div>
    </div>
  );
}

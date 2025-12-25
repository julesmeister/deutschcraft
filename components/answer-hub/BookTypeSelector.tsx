/**
 * Book Type Selector Component
 * Tab selector for Arbeitsbuch (AB) or Kursbuch (KB)
 */

'use client';

interface BookTypeSelectorProps {
  selectedBookType: 'AB' | 'KB';
  onBookTypeChange: (bookType: 'AB' | 'KB') => void;
}

export function BookTypeSelector({
  selectedBookType,
  onBookTypeChange,
}: BookTypeSelectorProps) {
  const tabs = [
    { value: 'AB' as const, label: 'Arbeitsbuch', description: 'Workbook' },
    { value: 'KB' as const, label: 'Kursbuch', description: 'Textbook' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-1 inline-flex">
      {tabs.map((tab) => {
        const isSelected = selectedBookType === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onBookTypeChange(tab.value)}
            className={`relative px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-black text-base">{tab.value}</span>
              <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                {tab.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

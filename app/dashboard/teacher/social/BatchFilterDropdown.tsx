import { CompactButtonDropdown } from '@/components/ui/CompactButtonDropdown';

interface BatchOption {
  value: string;
  label: string;
}

interface BatchFilterDropdownProps {
  filterBatch: string;
  batchOptions: BatchOption[];
  onChange: (value: string) => void;
  variant?: 'main' | 'sidebar';
}

export function BatchFilterDropdown({
  filterBatch,
  batchOptions,
  onChange,
  variant = 'main',
}: BatchFilterDropdownProps) {
  if (variant === 'sidebar') {
    return (
      <div className="bg-white border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter:</span>
          <div className="min-w-[160px] flex justify-end">
            <CompactButtonDropdown
              label={batchOptions.find(opt => opt.value === filterBatch)?.label || 'All Batches'}
              icon={<span>🎓</span>}
              options={batchOptions}
              value={filterBatch}
              onChange={onChange}
              buttonClassName="w-full justify-between bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 py-1.5 px-3 text-xs"
              usePortal
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-gray-700">Filter by Batch:</span>
      <CompactButtonDropdown
        label={batchOptions.find(opt => opt.value === filterBatch)?.label || 'All Batches'}
        icon={<span>📚</span>}
        options={batchOptions}
        value={filterBatch}
        onChange={onChange}
        buttonClassName="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      />
    </div>
  );
}

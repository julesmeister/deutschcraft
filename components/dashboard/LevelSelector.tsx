import { CompactButtonDropdown, DropdownOption } from '@/components/ui/CompactButtonDropdown';
import { CEFRLevel } from '@/lib/models';

interface LevelSelectorProps {
  currentLevel: string;
  studentId: string;
  onChangeLevel?: (studentId: string, newLevel: CEFRLevel) => void;
}

const LEVEL_OPTIONS: DropdownOption[] = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
];

export function LevelSelector({ currentLevel, studentId, onChangeLevel }: LevelSelectorProps) {
  const levelOptions = LEVEL_OPTIONS.map(option => ({
    ...option,
    disabled: option.value === currentLevel,
  }));

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <CompactButtonDropdown
        label={currentLevel}
        options={levelOptions}
        onChange={(newLevel) => {
          if (onChangeLevel && typeof newLevel === 'string') {
            onChangeLevel(studentId, newLevel as CEFRLevel);
          }
        }}
        usePortal={true}
        buttonClassName="!text-xs !py-1 !px-3 !bg-blue-50 hover:!bg-blue-100 !text-blue-700 !font-bold"
      />
    </div>
  );
}

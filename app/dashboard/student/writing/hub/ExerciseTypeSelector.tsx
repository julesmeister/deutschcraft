import { TabBar } from "@/components/ui/TabBar";

type ExerciseType = "translation" | "creative" | "email" | "letters" | "freestyle" | null;

interface ExerciseTypeSelectorProps {
  selectedType: ExerciseType;
  onTypeSelect: (type: ExerciseType) => void;
  translationCount: number;
  creativeCount: number;
  emailCount: number;
  letterCount: number;
}

export function ExerciseTypeSelector({
  selectedType,
  onTypeSelect,
  translationCount,
  creativeCount,
  emailCount,
  letterCount,
}: ExerciseTypeSelectorProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-neutral-900 mb-4">
        Choose Exercise Type
      </h2>
      <TabBar
        variant="tabs"
        size="compact"
        activeTabId={selectedType || undefined}
        onTabChange={(tabId) => onTypeSelect(tabId as ExerciseType)}
        tabs={[
          {
            id: "creative",
            label: "Creative Writing",
            icon: null,
            value: creativeCount,
          },
          {
            id: "translation",
            label: "Translation",
            icon: null,
            value: translationCount,
          },
          {
            id: "email",
            label: "Email Writing",
            icon: null,
            value: emailCount,
          },
          {
            id: "letters",
            label: "Letter Writing",
            icon: null,
            value: letterCount,
          },
          {
            id: "freestyle",
            label: "Freestyle",
            icon: null,
            value: "∞",
          },
        ]}
      />
    </div>
  );
}

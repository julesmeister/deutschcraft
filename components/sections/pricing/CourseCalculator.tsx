import { CEFRLevel } from "@/lib/models/cefr";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import type { CourseCalculation } from "@/lib/utils/pricingCalculator";
import type { SplitButtonOption } from "@/components/ui/SplitButtonGroup";
import { IntensitySelector } from "./IntensitySelector";
import { CourseResults } from "./CourseResults";

interface CourseCalculatorProps {
  selectedLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  hoursPerDay: number;
  onHoursChange: (hours: number) => void;
  intensityOptions: SplitButtonOption[];
  unavailableLevels: CEFRLevel[];
  courseCalc: CourseCalculation;
  levelDescription: string;
  isAvailable: boolean;
}

export function CourseCalculator({
  selectedLevel,
  onLevelChange,
  hoursPerDay,
  onHoursChange,
  intensityOptions,
  unavailableLevels,
  courseCalc,
  levelDescription,
  isAvailable,
}: CourseCalculatorProps) {
  return (
    <div className="mb-8 md:mb-16">
      <div className="bg-piku-yellow-light p-4 sm:p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl">
        {/* Title and Description */}
        <div className="mb-6 md:mb-8">
          <h3
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 md:mb-4"
            style={{ lineHeight: "1.25em" }}
          >
            Build Your Custom Course 🎯
          </h3>
          <p
            className="text-base md:text-lg text-gray-700"
            style={{ lineHeight: "1.6em" }}
          >
            Choose your CEFR level and study pace to see personalized pricing
            and timeline.
          </p>
        </div>

        {/* Selectors */}
        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
          {/* Level Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 md:mb-3">
              Select Your CEFR Level
            </label>
            <div className="hidden sm:block">
              <CEFRLevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={onLevelChange}
                colorScheme="cool"
                showDescription={false}
                size="md"
                unavailableLevels={unavailableLevels}
              />
            </div>
            <div className="block sm:hidden">
              <CEFRLevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={onLevelChange}
                colorScheme="cool"
                showDescription={false}
                size="sm"
                unavailableLevels={unavailableLevels}
              />
            </div>
          </div>

          {/* Study Intensity Selector */}
          <IntensitySelector
            hoursPerDay={hoursPerDay}
            onHoursChange={onHoursChange}
            intensityOptions={intensityOptions}
          />
        </div>

        {/* Results */}
        <CourseResults
          selectedLevel={selectedLevel}
          hoursPerDay={hoursPerDay}
          courseCalc={courseCalc}
          levelDescription={levelDescription}
          isAvailable={isAvailable}
        />
      </div>
    </div>
  );
}

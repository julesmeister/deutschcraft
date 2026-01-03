import {
  SplitButtonGroup,
  type SplitButtonOption,
} from "@/components/ui/SplitButtonGroup";
import { STUDY_INTENSITIES } from "@/lib/utils/pricingCalculator";

interface IntensitySelectorProps {
  hoursPerDay: number;
  onHoursChange: (hours: number) => void;
  intensityOptions: SplitButtonOption[];
}

export function IntensitySelector({
  hoursPerDay,
  onHoursChange,
  intensityOptions,
}: IntensitySelectorProps) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 md:mb-3">
        Choose Study Intensity
      </label>
      {/* Desktop - all 3 buttons in one row */}
      <div className="hidden lg:block">
        <SplitButtonGroup
          options={intensityOptions}
          value={String(hoursPerDay)}
          onChange={(value) => onHoursChange(Number(value))}
          colorScheme="teal"
          size="md"
        />
      </div>
      {/* Tablet - smaller buttons in one row */}
      <div className="hidden sm:block lg:hidden">
        <SplitButtonGroup
          options={intensityOptions}
          value={String(hoursPerDay)}
          onChange={(value) => onHoursChange(Number(value))}
          colorScheme="teal"
          size="sm"
        />
      </div>
      {/* Mobile - vertical stacked buttons */}
      <div className="block sm:hidden space-y-2">
        {STUDY_INTENSITIES.map((intensity) => {
          const isSelected = hoursPerDay === intensity.hoursPerDay;
          return (
            <button
              key={intensity.hoursPerDay}
              onClick={() => onHoursChange(intensity.hoursPerDay)}
              className={`
                w-full px-4 py-3 rounded-xl font-bold text-base transition-all
                ${
                  isSelected
                    ? "bg-piku-mint text-gray-900 shadow-md"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                }
              `}
            >
              {intensity.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { CEFRLevel } from "@/lib/models/cefr";
import {
  calculateCourse,
  CEFR_LEVEL_DATA,
  STUDY_INTENSITIES,
  type SplitButtonOption,
} from "@/lib/utils/pricingCalculator";
import { getCoursePricing } from "@/lib/services/pricingService";
import { PricingHeader } from "./pricing/PricingHeader";
import { CourseCalculator } from "./pricing/CourseCalculator";
import { TeacherSchoolPlans } from "./pricing/TeacherSchoolPlans";

export function CoursePricingSection() {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(CEFRLevel.A1);
  const [hoursPerDay, setHoursPerDay] = useState<number>(1);
  const [pricingData, setPricingData] = useState(CEFR_LEVEL_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Load pricing from Firestore on mount
  useEffect(() => {
    async function loadPricing() {
      try {
        const config = await getCoursePricing();
        setPricingData({ ...CEFR_LEVEL_DATA, ...(config.levels || {}) });
      } catch (error) {
        console.error("Error loading pricing:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPricing();
  }, []);

  const courseCalc = calculateCourse(selectedLevel, hoursPerDay, pricingData);
  const levelData = pricingData[selectedLevel];
  const isAvailable = levelData.basePrice > 0;

  // Prepare options for Study Intensity SplitButtonGroup
  const intensityOptions: SplitButtonOption[] = STUDY_INTENSITIES.map(
    (intensity) => ({
      value: String(intensity.hoursPerDay),
      label: intensity.label,
    })
  );

  // Determine unavailable levels
  const unavailableLevels = Object.values(CEFRLevel).filter(
    (level) => !pricingData[level] || pricingData[level].basePrice === 0
  );

  return (
    <section id="pricing" className="py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <PricingHeader />

        <CourseCalculator
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          hoursPerDay={hoursPerDay}
          onHoursChange={setHoursPerDay}
          intensityOptions={intensityOptions}
          unavailableLevels={unavailableLevels}
          courseCalc={courseCalc}
          levelDescription={levelData.description}
          isAvailable={isAvailable}
        />

        <TeacherSchoolPlans />
      </div>
    </section>
  );
}

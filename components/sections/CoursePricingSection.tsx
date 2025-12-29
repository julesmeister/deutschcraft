"use client";

import { useState, useEffect } from "react";
import { CEFRLevel, CEFRLevelInfo } from "@/lib/models/cefr";
import {
  calculateCourse,
  CEFR_LEVEL_DATA,
  STUDY_INTENSITIES,
  getPricingFeatures,
  type CourseCalculation,
} from "@/lib/utils/pricingCalculator";
import { getCoursePricing } from "@/lib/services/pricingService";
import {
  SplitButtonGroup,
  type SplitButtonOption,
} from "@/components/ui/SplitButtonGroup";
import { CEFRLevelSelector } from "@/components/ui/CEFRLevelSelector";
import {
  ScrollStagger,
  StaggerItem,
} from "@/components/animations/ScrollReveal";
import { motion } from "framer-motion";

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
        // Merge with default data to ensure all levels exist
        setPricingData({ ...CEFR_LEVEL_DATA, ...(config.levels || {}) });
      } catch (error) {
        console.error("Error loading pricing:", error);
        // Fall back to default pricing
      } finally {
        setIsLoading(false);
      }
    }
    loadPricing();
  }, []);

  const courseCalc = calculateCourse(selectedLevel, hoursPerDay, pricingData);
  const levelInfo = CEFRLevelInfo[selectedLevel];
  const levelData = pricingData[selectedLevel];
  const features = getPricingFeatures(selectedLevel);
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
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-block px-4 py-2 bg-brand-purple/10 text-brand-purple rounded-full text-sm font-medium mb-4">
            COURSE PRICING
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized course plans based on your CEFR level and study
            intensity
          </p>
        </div>

        {/* Interactive Calculator - Full width stacked */}
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
                Choose your CEFR level and study pace to see personalized
                pricing and timeline.
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
                    onLevelChange={setSelectedLevel}
                    colorScheme="cool"
                    showDescription={false}
                    size="md"
                    unavailableLevels={unavailableLevels}
                  />
                </div>
                <div className="block sm:hidden">
                  <CEFRLevelSelector
                    selectedLevel={selectedLevel}
                    onLevelChange={setSelectedLevel}
                    colorScheme="cool"
                    showDescription={false}
                    size="sm"
                    unavailableLevels={unavailableLevels}
                  />
                </div>
              </div>

              {/* Study Intensity Selector */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 md:mb-3">
                  Choose Study Intensity
                </label>
                {/* Desktop - all 3 buttons in one row */}
                <div className="hidden lg:block">
                  <SplitButtonGroup
                    options={intensityOptions}
                    value={String(hoursPerDay)}
                    onChange={(value) => setHoursPerDay(Number(value))}
                    colorScheme="teal"
                    size="md"
                  />
                </div>
                {/* Tablet - smaller buttons in one row */}
                <div className="hidden sm:block lg:hidden">
                  <SplitButtonGroup
                    options={intensityOptions}
                    value={String(hoursPerDay)}
                    onChange={(value) => setHoursPerDay(Number(value))}
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
                        onClick={() => setHoursPerDay(intensity.hoursPerDay)}
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
            </div>

            {/* Results */}
            <motion.div
              key={`${selectedLevel}-${hoursPerDay}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
              className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8"
            >
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">
                    Your Course
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                    {levelInfo.displayName}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 mb-3 md:mb-4">
                    {levelData.description}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xl sm:text-2xl">📚</span>
                      <span className="text-sm sm:text-base font-semibold">
                        {courseCalc.totalFlashcards} flashcards
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xl sm:text-2xl">⏱️</span>
                      <span className="text-sm sm:text-base font-semibold">
                        {courseCalc.totalStudyHours} total study hours
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xl sm:text-2xl">📅</span>
                      <span className="text-sm sm:text-base font-semibold">
                        {courseCalc.durationDisplay} at {hoursPerDay} hr
                        {hoursPerDay !== 1 ? "s" : ""}/day
                      </span>
                    </motion.div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">
                    Course Price
                  </div>
                  {isAvailable ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 100,
                        }}
                        className="flex items-baseline gap-1.5 sm:gap-2 mb-1"
                      >
                        <span className="text-3xl sm:text-4xl md:text-5xl font-black text-piku-purple">
                          ₱{courseCalc.price.toLocaleString()}
                        </span>
                        <span className="text-base sm:text-lg md:text-xl text-gray-600">
                          one-time
                        </span>
                      </motion.div>
                      <div className="text-xs sm:text-sm text-gray-500 mb-4 md:mb-6">
                        (~₱{courseCalc.pricePerWeek.toLocaleString()}/week)
                      </div>

                      <button className="theme-btn group w-full sm:w-auto inline-flex items-center justify-between bg-piku-purple-dark text-white font-black text-sm sm:text-[15px] py-2 pl-6 sm:pl-8 pr-2 rounded-md transition-all hover:scale-105">
                        <span className="btn-text relative z-10 transition-colors duration-300">
                          Enroll Now
                        </span>
                        <span className="btn-icon relative z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-piku-purple-dark rounded-md transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-start justify-center h-full min-h-[150px]">
                      <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-500 font-bold text-lg mb-2">
                        Coming Soon 🚧
                      </span>
                      <p className="text-sm text-gray-500">
                        This course level is currently under development.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Teacher & School Plans */}
        <div className="max-w-6xl mx-auto mt-8 md:mt-16">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
            For Teachers & Schools
          </h3>
          <ScrollStagger staggerDelay={0.15} variant="slideUp">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {[
                {
                  name: "Teacher",
                  price: "₱1,499",
                  color: "border-piku-orange-accent",
                  features: [
                    "Manage unlimited students",
                    "Custom assignments",
                    "Analytics dashboard",
                    "Priority support",
                  ],
                },
                {
                  name: "School",
                  price: "₱4,999",
                  color: "border-piku-pink-hot",
                  features: [
                    "Up to 50 students",
                    "Admin controls",
                    "Custom branding",
                    "Dedicated support",
                    "Bulk licensing",
                  ],
                },
              ].map((plan, i) => (
                <StaggerItem key={i} variant="slideUp">
                  <div
                    className={`bg-white p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl border-2 sm:border-4 ${plan.color} transition-all hover:-translate-y-2 hover:shadow-xl h-full`}
                  >
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                        {plan.price}
                      </span>
                      <span className="text-sm sm:text-base text-gray-600">
                        /month
                      </span>
                    </div>
                    <button className="theme-btn group w-full inline-flex items-center justify-between bg-piku-purple-dark text-white font-black text-sm sm:text-[15px] py-2 pl-6 sm:pl-8 pr-2 rounded-md mb-4 sm:mb-6 hover:scale-105 transition-transform">
                      <span className="btn-text relative z-10 transition-colors duration-300">
                        Start Free Trial
                      </span>
                      <span className="btn-icon relative z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-piku-purple-dark rounded-md transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </button>
                    <ul className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm sm:text-base">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </ScrollStagger>
        </div>
      </div>
    </section>
  );
}

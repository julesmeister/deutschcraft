import { motion } from "framer-motion";
import { CEFRLevel, CEFRLevelInfo } from "@/lib/models/cefr";
import type { CourseCalculation } from "@/lib/utils/pricingCalculator";

interface CourseResultsProps {
  selectedLevel: CEFRLevel;
  hoursPerDay: number;
  courseCalc: CourseCalculation;
  levelDescription: string;
  isAvailable: boolean;
}

export function CourseResults({
  selectedLevel,
  hoursPerDay,
  courseCalc,
  levelDescription,
  isAvailable,
}: CourseResultsProps) {
  const levelInfo = CEFRLevelInfo[selectedLevel];

  return (
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
            {levelDescription}
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
  );
}

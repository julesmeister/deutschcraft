import { CEFRLevel } from "@/lib/models/cefr";

/**
 * Data for each CEFR level based on actual flashcard counts and syllabus weeks
 */
export const CEFR_LEVEL_DATA = {
  [CEFRLevel.A1]: {
    flashcardCount: 585,
    syllabusWeeks: 12,
    basePrice: 2499, // ₱2,499 for A1
    description: "Perfect for absolute beginners",
  },
  [CEFRLevel.A2]: {
    flashcardCount: 1124,
    syllabusWeeks: 16,
    basePrice: 3999, // ₱3,999 for A2
    description: "Build on your basics",
  },
  [CEFRLevel.B1]: {
    flashcardCount: 1524,
    syllabusWeeks: 20,
    basePrice: 4999, // ₱4,999 for B1
    description: "Reach conversational fluency",
  },
  [CEFRLevel.B2]: {
    flashcardCount: 573,
    syllabusWeeks: 24,
    basePrice: 6499, // ₱6,499 for B2
    description: "Master complex topics",
  },
  [CEFRLevel.C1]: {
    flashcardCount: 116,
    syllabusWeeks: 28,
    basePrice: 7499, // ₱7,499 for C1
    description: "Near-native proficiency",
  },
  [CEFRLevel.C2]: {
    flashcardCount: 72,
    syllabusWeeks: 32,
    basePrice: 8499, // ₱8,499 for C2
    description: "Complete mastery",
  },
};

export interface StudyIntensity {
  hoursPerDay: number;
  label: string;
  multiplier: number; // Speed multiplier (not linear due to retention)
}

export const STUDY_INTENSITIES: StudyIntensity[] = [
  { hoursPerDay: 0.5, label: "30 mins/day (Casual)", multiplier: 0.5 },
  { hoursPerDay: 1, label: "1 hour/day (Regular)", multiplier: 1 },
  { hoursPerDay: 2, label: "2 hours/day (Intensive)", multiplier: 1.5 },
  { hoursPerDay: 3, label: "3 hours/day (Very Intensive)", multiplier: 2 },
  { hoursPerDay: 4, label: "4 hours/day (Full Immersion)", multiplier: 2.5 },
];

export interface CourseCalculation {
  level: CEFRLevel;
  hoursPerDay: number;
  totalFlashcards: number;
  baseWeeks: number;
  adjustedWeeks: number;
  totalStudyHours: number;
  price: number;
  pricePerWeek: number;
  durationDisplay: string;
}

/**
 * Calculate course duration and pricing for a given CEFR level and study intensity
 */
export function calculateCourse(
  level: CEFRLevel,
  hoursPerDay: number,
  pricingData: typeof CEFR_LEVEL_DATA = CEFR_LEVEL_DATA
): CourseCalculation {
  // Fallback to default data if the specific level is missing in the provided pricingData
  const levelData = pricingData?.[level] || CEFR_LEVEL_DATA[level];
  const intensity =
    STUDY_INTENSITIES.find((i) => i.hoursPerDay === hoursPerDay) ||
    STUDY_INTENSITIES[1];

  // Calculate adjusted duration
  const adjustedWeeks = Math.ceil(
    levelData.syllabusWeeks / intensity.multiplier
  );
  const totalStudyHours = Math.ceil(levelData.syllabusWeeks * 7 * hoursPerDay);

  // Format duration display
  let durationDisplay: string;
  if (adjustedWeeks < 4) {
    const days = adjustedWeeks * 7;
    durationDisplay = `${days} days`;
  } else if (adjustedWeeks < 8) {
    durationDisplay = `${adjustedWeeks} weeks`;
  } else {
    const months = Math.ceil(adjustedWeeks / 4);
    durationDisplay = `${months} month${months > 1 ? "s" : ""}`;
  }

  // Calculate price (base price is fixed per level, not duration-based)
  const price = levelData.basePrice;
  const pricePerWeek = Math.round(price / adjustedWeeks);

  return {
    level,
    hoursPerDay,
    totalFlashcards: levelData.flashcardCount,
    baseWeeks: levelData.syllabusWeeks,
    adjustedWeeks,
    totalStudyHours,
    price,
    pricePerWeek,
    durationDisplay,
  };
}

/**
 * Get all available course options for comparison
 */
export function getAllCourseOptions(): CourseCalculation[] {
  const options: CourseCalculation[] = [];

  // Generate options for each level with Regular (1hr/day) intensity
  Object.values(CEFRLevel).forEach((level) => {
    options.push(calculateCourse(level, 1));
  });

  return options;
}

/**
 * Get pricing features for a CEFR level
 */
export function getPricingFeatures(level: CEFRLevel): string[] {
  const baseFeatures = [
    "Unlimited flashcard practice",
    "AI-generated sentences",
    "Progress tracking",
    "Mobile & web access",
  ];

  const levelData = CEFR_LEVEL_DATA[level];
  const levelSpecific = [
    `${levelData.flashcardCount}+ flashcards`,
    `${levelData.syllabusWeeks}-week structured syllabus`,
    "Grammar explanations",
    "Vocabulary themes",
  ];

  // Add premium features for advanced levels
  if (
    level === CEFRLevel.B2 ||
    level === CEFRLevel.C1 ||
    level === CEFRLevel.C2
  ) {
    levelSpecific.push("Advanced idioms & expressions");
    levelSpecific.push("Complex grammar patterns");
  }

  return [...baseFeatures, ...levelSpecific];
}

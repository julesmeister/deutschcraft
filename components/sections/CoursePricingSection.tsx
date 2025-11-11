'use client';

import { useState, useEffect } from 'react';
import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import {
  calculateCourse,
  CEFR_LEVEL_DATA,
  STUDY_INTENSITIES,
  getPricingFeatures,
  type CourseCalculation,
} from '@/lib/utils/pricingCalculator';
import { getCoursePricing } from '@/lib/services/pricingService';
import { SplitButtonGroup, type SplitButtonOption } from '@/components/ui/SplitButtonGroup';
import { ScrollStagger, StaggerItem } from '@/components/animations/ScrollReveal';
import { motion } from 'framer-motion';

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
        setPricingData(config.levels);
      } catch (error) {
        console.error('Error loading pricing:', error);
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

  // Prepare options for SplitButtonGroup
  const levelOptions: SplitButtonOption[] = Object.values(CEFRLevel).map((level) => ({
    value: level,
    label: level,
  }));

  const intensityOptions: SplitButtonOption[] = STUDY_INTENSITIES.map((intensity) => ({
    value: String(intensity.hoursPerDay),
    label: intensity.label,
  }));

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-brand-purple/10 text-brand-purple rounded-full text-sm font-medium mb-4">
            COURSE PRICING
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized course plans based on your CEFR level and study intensity
          </p>
        </div>

        {/* Interactive Calculator - Full width stacked */}
        <div className="mb-16">
          <div className="bg-piku-yellow-light p-8 md:p-12 rounded-3xl">
            {/* Title and Description */}
            <div className="mb-8">
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4" style={{ lineHeight: '1.25em' }}>
                Build Your Custom Course 🎯
              </h3>
              <p className="text-lg text-gray-700" style={{ lineHeight: '1.6em' }}>
                Choose your CEFR level and study pace to see personalized pricing and timeline.
              </p>
            </div>

            {/* Selectors */}
            <div className="space-y-6 mb-8">
              {/* Level Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Select Your CEFR Level
                </label>
                <SplitButtonGroup
                  options={levelOptions}
                  value={selectedLevel}
                  onChange={(value) => setSelectedLevel(value as CEFRLevel)}
                  colorScheme="teal"
                  size="md"
                />
              </div>

              {/* Study Intensity Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Choose Study Intensity
                </label>
                <SplitButtonGroup
                  options={intensityOptions}
                  value={String(hoursPerDay)}
                  onChange={(value) => setHoursPerDay(Number(value))}
                  colorScheme="teal"
                  size="md"
                />
              </div>
            </div>

            {/* Results */}
            <motion.div
              key={`${selectedLevel}-${hoursPerDay}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
              className="bg-white rounded-3xl p-8"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-1">Your Course</div>
                  <div className="text-3xl font-black text-gray-900 mb-2">
                    {levelInfo.displayName} - {levelInfo.name}
                  </div>
                  <div className="text-gray-600 mb-4">{levelData.description}</div>

                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-2xl">📚</span>
                      <span className="font-semibold">{courseCalc.totalFlashcards} flashcards</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-2xl">⏱️</span>
                      <span className="font-semibold">{courseCalc.totalStudyHours} total study hours</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-2xl">📅</span>
                      <span className="font-semibold">{courseCalc.durationDisplay} at {hoursPerDay} hr{hoursPerDay !== 1 ? 's' : ''}/day</span>
                    </motion.div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Course Price</div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    className="flex items-baseline gap-2 mb-1"
                  >
                    <span className="text-5xl font-black text-piku-purple">₱{courseCalc.price.toLocaleString()}</span>
                    <span className="text-xl text-gray-600">one-time</span>
                  </motion.div>
                  <div className="text-sm text-gray-500 mb-6">
                    (~₱{courseCalc.pricePerWeek.toLocaleString()}/week)
                  </div>

                  <button className="theme-btn group inline-flex items-center justify-between bg-piku-purple-dark text-white font-black text-[15px] py-2 pl-8 pr-2 rounded-md transition-all hover:scale-105">
                    <span className="btn-text relative z-10 transition-colors duration-300">Enroll Now</span>
                    <span className="btn-icon relative z-10 w-12 h-12 flex items-center justify-center bg-white text-piku-purple-dark rounded-md transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Teacher & School Plans */}
        <div className="max-w-6xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            For Teachers & Schools
          </h3>
          <ScrollStagger staggerDelay={0.15} variant="slideUp">
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Teacher',
                  price: '₱1,499',
                  color: 'border-piku-orange-accent',
                  features: ['Manage unlimited students', 'Custom assignments', 'Analytics dashboard', 'Priority support'],
                },
                {
                  name: 'School',
                  price: '₱4,999',
                  color: 'border-piku-pink-hot',
                  features: ['Up to 50 students', 'Admin controls', 'Custom branding', 'Dedicated support', 'Bulk licensing'],
                },
              ].map((plan, i) => (
                <StaggerItem key={i} variant="slideUp">
                  <div className={`bg-white p-8 rounded-2xl border-4 ${plan.color} transition-all hover:-translate-y-2 hover:shadow-xl h-full`}>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <button className="theme-btn group w-full inline-flex items-center justify-between bg-piku-purple-dark text-white font-black text-[15px] py-2 pl-8 pr-2 rounded-md mb-6 hover:scale-105 transition-transform">
                      <span className="btn-text relative z-10 transition-colors duration-300">Start Free Trial</span>
                      <span className="btn-icon relative z-10 w-12 h-12 flex items-center justify-center bg-white text-piku-purple-dark rounded-md transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                    <ul className="space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
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

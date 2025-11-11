'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CEFRLevel } from '@/lib/models/cefr';
import { CEFR_LEVEL_DATA, calculateCourse } from '@/lib/utils/pricingCalculator';
import { getCoursePricing, saveCoursePricing } from '@/lib/services/pricingService';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast';
import { PricingLevelCard } from './PricingLevelCard';
import { PricingInfoCards } from './PricingInfoCards';

interface LevelPricingData {
  level: CEFRLevel;
  flashcardCount: number;
  syllabusWeeks: number;
  basePrice: number;
  description: string;
}

export default function TeacherPricingPage() {
  const { data: session } = useSession();
  const toast = useToast();

  // Initialize state with current pricing data
  const [pricingData, setPricingData] = useState<LevelPricingData[]>(
    Object.values(CEFRLevel).map((level) => ({
      level,
      ...CEFR_LEVEL_DATA[level],
    }))
  );

  const [editingLevel, setEditingLevel] = useState<CEFRLevel | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load pricing data from Firestore on mount
  useEffect(() => {
    async function loadPricing() {
      try {
        const config = await getCoursePricing();
        const loadedData = Object.values(CEFRLevel).map((level) => ({
          level,
          ...config.levels[level],
        }));
        setPricingData(loadedData);
      } catch (error) {
        console.error('Error loading pricing:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPricing();
  }, []);

  const handleEdit = (level: CEFRLevel) => {
    setEditingLevel(level);
  };

  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!session?.user?.email) {
      toast.error('You must be logged in to save pricing changes.');
      setShowSaveDialog(false);
      return;
    }

    setIsSaving(true);
    try {
      // Convert pricingData array back to config object
      const config = {
        levels: pricingData.reduce((acc, item) => {
          acc[item.level] = {
            flashcardCount: item.flashcardCount,
            syllabusWeeks: item.syllabusWeeks,
            basePrice: item.basePrice,
            description: item.description,
          };
          return acc;
        }, {} as any),
        currency: 'PHP',
        currencySymbol: '₱',
        updatedAt: Date.now(),
        updatedBy: session.user.email,
      };

      await saveCoursePricing(config, session.user.email);

      setHasChanges(false);
      setEditingLevel(null);
      setShowSaveDialog(false);
      toast.success('Pricing data saved successfully!');
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('Failed to save pricing data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setPricingData(
      Object.values(CEFRLevel).map((level) => ({
        level,
        ...CEFR_LEVEL_DATA[level],
      }))
    );
    setHasChanges(false);
    setEditingLevel(null);
  };

  const handleFieldChange = (
    level: CEFRLevel,
    field: keyof LevelPricingData,
    value: string | number
  ) => {
    setPricingData((prev) =>
      prev.map((item) =>
        item.level === level ? { ...item, [field]: value } : item
      )
    );
    setHasChanges(true);
  };

  // Get preview calculations for 1 hr/day
  const getPreviewCalc = (level: CEFRLevel) => {
    const data = pricingData.find((item) => item.level === level);
    if (!data) return null;

    // Use current edited values for preview
    const calc = calculateCourse(level, 1);
    return {
      ...calc,
      price: data.basePrice,
      pricePerWeek: Math.round(data.basePrice / data.syllabusWeeks),
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-piku-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onConfirm={handleConfirmSave}
        title="Save Pricing Changes"
        message="Are you sure you want to save these pricing changes? This will update the pricing for all students on the landing page."
        confirmText="Save Changes"
        cancelText="Cancel"
        variant="primary"
        isLoading={isSaving}
      />

      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-30 bg-gray-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Course Pricing Management 💰
              </h1>
              <p className="text-gray-600 mt-1">
                Edit pricing, flashcard counts, and syllabus durations for each CEFR level
              </p>
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    size="md"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    variant="primary"
                    size="md"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
              {!hasChanges && (
                <div className="text-sm text-gray-500 italic">
                  Click "Edit" on any level to make changes
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Editor */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6">
          {pricingData.map((item) => {
            const isEditing = editingLevel === item.level;
            const preview = getPreviewCalc(item.level);

            return (
              <PricingLevelCard
                key={item.level}
                item={item}
                isEditing={isEditing}
                preview={preview}
                onEdit={handleEdit}
                onFieldChange={handleFieldChange}
              />
            );
          })}
        </div>

        {/* Info Cards */}
        <PricingInfoCards />
      </div>
    </div>
  );
}

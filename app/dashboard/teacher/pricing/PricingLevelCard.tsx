import { CEFRLevel, CEFRLevelInfo } from '@/lib/models/cefr';
import { Input } from '@/components/ui/Input';

interface LevelPricingData {
  level: CEFRLevel;
  flashcardCount: number;
  syllabusWeeks: number;
  basePrice: number;
  description: string;
}

interface PricingLevelCardProps {
  item: LevelPricingData;
  isEditing: boolean;
  preview: {
    price: number;
    pricePerWeek: number;
  } | null;
  onEdit: (level: CEFRLevel) => void;
  onCancel: () => void;
  onToggleAvailability: (level: CEFRLevel) => void;
  onFieldChange: (
    level: CEFRLevel,
    field: keyof LevelPricingData,
    value: string | number
  ) => void;
}

const borderColors = {
  [CEFRLevel.A1]: 'border-pastel-ocean',
  [CEFRLevel.A2]: 'border-pastel-coral',
  [CEFRLevel.B1]: 'border-pastel-blossom',
  [CEFRLevel.B2]: 'border-pastel-aqua',
  [CEFRLevel.C1]: 'border-piku-purple',
  [CEFRLevel.C2]: 'border-piku-cyan-accent',
};

export function PricingLevelCard({
  item,
  isEditing,
  preview,
  onEdit,
  onCancel,
  onToggleAvailability,
  onFieldChange,
}: PricingLevelCardProps) {
  const levelInfo = CEFRLevelInfo[item.level];
  const isAvailable = item.basePrice > 0;

  const handleDone = () => {
    // Just exit edit mode
    // The changes are already in the parent state via onFieldChange
    onCancel(); 
  };

  return (
      <div className={`bg-white border-4 ${borderColors[item.level]} rounded-2xl p-6 transition-all ${
        isEditing ? 'ring-4 ring-piku-purple ring-offset-2' : ''
      } ${!isAvailable && !isEditing ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Level Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-gray-900">
                  {levelInfo.displayName}
                </h2>
                {isEditing && (
                  <span className="px-3 py-1 bg-piku-purple/10 text-piku-purple text-xs font-bold rounded-full">
                    EDITING
                  </span>
                )}
                {!isAvailable && !isEditing && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full border border-gray-200">
                    UNAVAILABLE
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{levelInfo.description}</p>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleDone}
                    className="px-4 py-2 bg-piku-purple text-white hover:bg-piku-purple-dark rounded-lg text-sm font-bold transition-all"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onToggleAvailability(item.level)}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                      isAvailable
                        ? 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                        : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {isAvailable ? 'Set Unavailable' : 'Set Available'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(item.level)}
                    className="px-4 py-2 bg-gray-100 hover:bg-piku-purple hover:text-white rounded-lg text-sm font-bold transition-all"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Description */}
            <div className="md:col-span-2">
              <Input
                label="Description"
                type="text"
                value={item.description || ''}
                onChange={(e) =>
                  onFieldChange(item.level, 'description', e.target.value)
                }
                disabled={!isEditing}
                containerClassName="mb-0"
              />
            </div>

            {/* Flashcard Count */}
            <div>
              <Input
                label="Flashcard Count"
                type="number"
                value={(item.flashcardCount || 0).toString()}
                onChange={(e) =>
                  onFieldChange(item.level, 'flashcardCount', parseInt(e.target.value) || 0)
                }
                disabled={!isEditing}
                containerClassName="mb-0"
              />
            </div>

            {/* Syllabus Weeks */}
            <div>
              <Input
                label="Syllabus Weeks (at 1 hr/day)"
                type="number"
                value={(item.syllabusWeeks || 0).toString()}
                onChange={(e) =>
                  onFieldChange(item.level, 'syllabusWeeks', parseInt(e.target.value) || 0)
                }
                disabled={!isEditing}
                containerClassName="mb-0"
              />
            </div>

            {/* Base Price */}
            <div className="md:col-span-2">
              <Input
                label="Base Price (₱)"
                type="number"
                value={(item.basePrice || 0).toString()}
                onChange={(e) =>
                  onFieldChange(item.level, 'basePrice', parseInt(e.target.value) || 0)
                }
                disabled={!isEditing}
                leftIcon={<span className="text-lg">₱</span>}
                containerClassName="mb-0"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Preview */}
        {preview && (
          <div className="lg:w-80 bg-gradient-to-br from-piku-purple/5 to-piku-cyan-accent/5 rounded-xl p-6 border-2 border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4">
              Preview (1 hr/day baseline)
            </h3>
            
            {isAvailable ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Course Price:</span>
                  <span className="text-2xl font-black text-piku-purple">
                    ₱{(item.basePrice || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price per week:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₱{(preview.pricePerWeek || 0).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📚</span>
                    <span className="text-sm text-gray-700">
                      {item.flashcardCount} flashcards
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📅</span>
                    <span className="text-sm text-gray-700">
                      {item.syllabusWeeks} weeks duration
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    <span className="text-sm text-gray-700">
                      {Math.ceil(item.syllabusWeeks * 7)} total hours
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <span className="text-4xl mb-3">🚧</span>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Unavailable</h4>
                <p className="text-sm text-gray-500">
                  This course will show as "Coming Soon" to students.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

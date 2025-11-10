'use client';

import { useFlashcardSettings } from '@/lib/hooks/useFlashcardSettings';
import { useToast } from '@/components/ui/toast';

export function FlashcardSettingsTab() {
  const { settings, isLoading, updateSettings } = useFlashcardSettings();
  const toast = useToast();

  const cardOptions = [
    { value: 10, label: '10 cards per session' },
    { value: 20, label: '20 cards per session' },
    { value: 30, label: '30 cards per session' },
    { value: 50, label: '50 cards per session' },
    { value: 100, label: '100 cards per session' },
    { value: -1, label: 'All cards (no limit)' },
  ];

  const handleUpdate = async (field: keyof typeof settings, value: any) => {
    await updateSettings({ [field]: value });
    toast.success('Settings saved', { duration: 2000, showIcon: false });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Flashcard Settings</h2>
        <p className="text-gray-600">Customize your flashcard practice experience</p>
      </div>

      <div className="space-y-6">
        {/* Cards Per Session */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Cards Per Session
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Choose how many flashcards you want to review in each practice session
          </p>
          <div className="space-y-2">
            {cardOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name="cardsPerSession"
                  value={option.value}
                  checked={settings.cardsPerSession === option.value}
                  onChange={() => handleUpdate('cardsPerSession', option.value)}
                  className="w-4 h-4 text-blue-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-900">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Auto-play Audio */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Auto-play Audio
              </label>
              <p className="text-sm text-gray-600">
                Automatically play pronunciation when revealing cards
              </p>
            </div>
            <button
              onClick={() => handleUpdate('autoPlayAudio', !settings.autoPlayAudio)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoPlayAudio ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoPlayAudio ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Show Examples */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Show Example Sentences
              </label>
              <p className="text-sm text-gray-600">
                Display example sentences when available
              </p>
            </div>
            <button
              onClick={() => handleUpdate('showExamples', !settings.showExamples)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showExamples ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showExamples ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Randomize Order */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Randomize Card Order
              </label>
              <p className="text-sm text-gray-600">
                Shuffle cards in a random order for each session
              </p>
            </div>
            <button
              onClick={() => handleUpdate('randomizeOrder', !settings.randomizeOrder)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.randomizeOrder ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.randomizeOrder ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

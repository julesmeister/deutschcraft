/**
 * Hidden Exercises Modal
 * Shows all hidden exercises with unhide options for teachers
 */

'use client';

import { EyeOff, Eye, X } from 'lucide-react';

interface HiddenExercise {
  exerciseId: string;
  overrideId: string;
}

interface HiddenExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hiddenExercises: HiddenExercise[];
  onUnhide: (exerciseId: string) => void;
}

export function HiddenExercisesModal({
  isOpen,
  onClose,
  hiddenExercises,
  onUnhide,
}: HiddenExercisesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hidden Exercises</h2>
              <p className="text-sm text-gray-600">
                {hiddenExercises.length} exercise{hiddenExercises.length !== 1 ? 's' : ''} hidden
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {hiddenExercises.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hidden Exercises</h3>
              <p className="text-gray-600">All exercises are currently visible to students.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hiddenExercises.map(({ exerciseId, overrideId }) => (
                <div
                  key={overrideId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <EyeOff className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{exerciseId}</h3>
                      <p className="text-sm text-gray-600">Hidden from students</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUnhide(exerciseId)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    Unhide
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

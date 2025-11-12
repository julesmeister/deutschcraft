/**
 * ScoreSlider Component
 * Reusable score slider for grading
 */

interface ScoreSliderProps {
  label: string;
  score: number;
  onChange: (score: number) => void;
  color: 'emerald' | 'purple' | 'amber';
}

const colorClasses = {
  emerald: 'text-emerald-600 accent-emerald-600',
  purple: 'text-purple-600 accent-purple-600',
  amber: 'text-amber-600 accent-amber-600',
};

export function ScoreSlider({ label, score, onChange, color }: ScoreSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className={`text-2xl font-black ${colorClasses[color]}`}>
          {score}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={score}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colorClasses[color]}`}
        style={{
          background: `linear-gradient(to right,
            currentColor 0%,
            currentColor ${score}%,
            #e5e7eb ${score}%,
            #e5e7eb 100%)`
        }}
      />
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

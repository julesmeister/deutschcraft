import { AudioSection } from '@/lib/models/audio';

interface AudioSectionCardProps {
  section: AudioSection;
  onSelect: () => void;
}

export function AudioSectionCard({ section, onSelect }: AudioSectionCardProps) {
  const totalDuration = section.audios.reduce((sum, audio) => sum + audio.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div
      onClick={onSelect}
      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Section Number */}
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-black text-blue-600">{section.sectionNumber}</span>
        </div>

        {/* Section Info */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-gray-600 mb-3">{section.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🎵 {section.audios.length} tracks</span>
            <span>•</span>
            <span>⏱️ {totalMinutes} min</span>
          </div>
        </div>

        {/* Play Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

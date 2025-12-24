/**
 * CorrectedTextSection Component
 * Displays a corrected version of text with diff highlighting
 */

import { DiffTextCorrectedOnly } from '@/components/writing/DiffText';
import { SectionHeader } from './SectionHeader';

interface CorrectedTextSectionProps {
  icon?: string;
  label: string;
  labelColor?: string;
  badge?: string;
  badgeColor?: string;
  originalText: string;
  correctedText: string;
  onStartQuiz?: () => void;
  className?: string;
}

export function CorrectedTextSection({
  icon,
  label,
  labelColor,
  badge,
  badgeColor,
  originalText,
  correctedText,
  onStartQuiz,
  className = 'text-lg',
}: CorrectedTextSectionProps) {
  return (
    <div>
      <SectionHeader
        icon={icon}
        label={label}
        labelColor={labelColor}
        badge={badge}
        badgeColor={badgeColor}
        action={
          onStartQuiz && (
            <button
              onClick={onStartQuiz}
              className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>📝</span> Test Yourself
            </button>
          )
        }
      />
      <DiffTextCorrectedOnly
        originalText={originalText}
        correctedText={correctedText}
        className={className}
      />
    </div>
  );
}

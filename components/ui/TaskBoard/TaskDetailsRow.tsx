'use client';

import { DetailRow, DetailTag, DetailGrid } from '@/components/ui/DetailRow';

interface TaskDetailsRowProps {
  task: any;
}

export function TaskDetailsRow({ task }: TaskDetailsRowProps) {
  // Check if there's any detail to show
  const hasDetails = task.instructions ||
                     task.minWords || task.maxWords ||
                     task.minParagraphs || task.maxParagraphs ||
                     task.tone || task.perspective || task.totalPoints ||
                     task.requireIntroduction || task.requireConclusion || task.requireExamples;

  if (!hasDetails) return null;

  // Tone display mapping for German tones
  const toneLabels: Record<string, string> = {
    'formell': 'Formell',
    'informell': 'Informell',
    'sachlich': 'Sachlich',
    'persönlich': 'Persönlich',
    'offiziell': 'Offiziell',
  };

  // Perspective display mapping
  const perspectiveLabels: Record<string, string> = {
    'first-person': 'First Person',
    'second-person': 'Second Person',
    'third-person': 'Third Person',
  };

  // Format word/paragraph range
  const formatRange = (min?: number, max?: number) => {
    if (min && max) return `${min} - ${max}`;
    if (min) return `Min ${min}`;
    if (max) return `Max ${max}`;
    return null;
  };

  const wordCountRange = formatRange(task.minWords, task.maxWords);
  const paragraphRange = formatRange(task.minParagraphs, task.maxParagraphs);

  return (
    <tr className="border-t border-neutral-100">
      <td colSpan={7} className="px-6 py-5">
        <div className="ml-12 text-neutral-500 text-sm font-medium leading-snug">
          {/* Criteria Grid */}
          <DetailGrid>
            {/* Left Column */}
            <div className="flex flex-col">
              {/* Word Count */}
              {wordCountRange && (
                <DetailRow
                  icon={
                    <svg strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="1em" xmlns="http://www.w3.org/2000/svg" className="h-5 fill-none stroke-current">
                      <path d="M12 5l0 14"></path>
                      <path d="M5 12l14 0"></path>
                    </svg>
                  }
                  label="Word Count"
                >
                  <span className="font-semibold text-neutral-900">{wordCountRange}</span>
                </DetailRow>
              )}

              {/* Paragraph Count */}
              {paragraphRange && (
                <DetailRow
                  icon={
                    <svg strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="1em" xmlns="http://www.w3.org/2000/svg" className="h-5 fill-none stroke-current">
                      <path d="M13 4v16"></path>
                      <path d="M17 4v16"></path>
                      <path d="M19 4h-10a4 4 0 0 0 0 8h10"></path>
                      <path d="M19 12h-6a4 4 0 0 0 0 8h6"></path>
                    </svg>
                  }
                  label="Paragraphs"
                >
                  <span className="font-semibold text-neutral-900">{paragraphRange}</span>
                </DetailRow>
              )}

              {/* Total Points */}
              {task.totalPoints && (
                <DetailRow
                  icon={
                    <svg strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="1em" xmlns="http://www.w3.org/2000/svg" className="h-5 fill-none stroke-current">
                      <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"></path>
                    </svg>
                  }
                  label="Points"
                >
                  <span className="font-semibold text-neutral-900">{task.totalPoints}</span>
                </DetailRow>
              )}
            </div>

            {/* Right Column */}
            <div className="flex flex-col">
              {/* Tone */}
              {task.tone && (
                <DetailRow
                  icon={
                    <svg strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="1em" xmlns="http://www.w3.org/2000/svg" className="h-5 fill-none stroke-current">
                      <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
                      <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
                      <path d="M3 6l0 13"></path>
                      <path d="M12 6l0 13"></path>
                      <path d="M21 6l0 13"></path>
                    </svg>
                  }
                  label="Tone"
                >
                  <DetailTag label={toneLabels[task.tone] || task.tone} color="blue" />
                </DetailRow>
              )}

              {/* Perspective */}
              {task.perspective && (
                <DetailRow
                  icon={
                    <svg strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="1em" xmlns="http://www.w3.org/2000/svg" className="h-5 fill-none stroke-current">
                      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
                      <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                    </svg>
                  }
                  label="Perspective"
                >
                  <DetailTag label={perspectiveLabels[task.perspective] || task.perspective} color="purple" />
                </DetailRow>
              )}

              {/* Structure Requirements */}
              {(task.requireIntroduction || task.requireConclusion || task.requireExamples) && (
                <DetailRow
                  icon={
                    <svg strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="1em" xmlns="http://www.w3.org/2000/svg" className="h-5 fill-none stroke-current">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                  }
                  label="Structure"
                >
                  <div className="inline-flex gap-x-1 gap-y-1 flex-wrap">
                    {task.requireIntroduction && <DetailTag label="Introduction" color="emerald" />}
                    {task.requireConclusion && <DetailTag label="Conclusion" color="sky" />}
                    {task.requireExamples && <DetailTag label="Examples" color="amber" />}
                  </div>
                </DetailRow>
              )}
            </div>
          </DetailGrid>

          {/* Instructions - Full width at bottom */}
          {task.instructions && (
            <div className="mt-8">
              <h5 className="text-neutral-900 text-lg font-bold leading-normal mb-4">
                Instructions
              </h5>
              <div className="text-neutral-500 text-base leading-relaxed">
                <p className="my-4 text-sm leading-snug">
                  {task.instructions}
                </p>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

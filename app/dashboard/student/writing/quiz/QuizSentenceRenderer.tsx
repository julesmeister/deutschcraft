import { QuizBlank } from '@/lib/models/writing';
import { GermanCharAutocomplete } from '@/components/writing/GermanCharAutocomplete';

interface QuizSentenceRendererProps {
  sentenceText: string;
  blank: QuizBlank;
  sentenceIndex: number;
  userAnswer: string;
  showResults: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
  inputRef: HTMLInputElement | null;
  onAnswerChange: (sentenceIndex: number, value: string) => void;
  onInputRef: (sentenceIndex: number, el: HTMLInputElement | null) => void;
}

export function QuizSentenceRenderer({
  sentenceText,
  blank,
  sentenceIndex,
  userAnswer,
  showResults,
  isCorrect,
  isIncorrect,
  inputRef,
  onAnswerChange,
  onInputRef,
}: QuizSentenceRendererProps) {
  const parts: Array<{ type: 'text' | 'blank'; content: string }> = [];

  // Add text before blank
  if (blank.position > 0) {
    parts.push({
      type: 'text',
      content: sentenceText.substring(0, blank.position),
    });
  }

  // Add blank
  parts.push({
    type: 'blank',
    content: blank.correctAnswer,
  });

  // Add remaining text
  let endPosition = blank.position + blank.correctAnswer.length;
  while (endPosition < sentenceText.length && /[^\w\s]/.test(sentenceText[endPosition])) {
    endPosition++;
  }

  if (endPosition < sentenceText.length) {
    parts.push({
      type: 'text',
      content: sentenceText.substring(endPosition),
    });
  }

  return (
    <div className="text-base leading-relaxed">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index} className="text-gray-900">{part.content}</span>;
        } else {
          return (
            <span key={index} className="inline-flex items-center gap-1 mx-1 my-1 relative">
              <input
                ref={(el) => { onInputRef(sentenceIndex, el); }}
                type="text"
                value={userAnswer}
                onChange={(e) => onAnswerChange(sentenceIndex, e.target.value)}
                disabled={showResults}
                className={`text-sm font-bold text-center transition-all outline-none ${
                  isCorrect
                    ? 'bg-piku-mint text-gray-900 px-1.5 py-1 rounded-md'
                    : isIncorrect
                    ? 'bg-red-100 text-red-700 px-1.5 py-1 rounded-l-md'
                    : 'bg-gray-100 hover:bg-gray-150 focus:bg-white focus:ring-2 focus:ring-blue-400 rounded-md px-1.5 py-1'
                }`}
                style={{ width: `${Math.max(part.content.length * 9, 50)}px` }}
              />
              {!showResults && inputRef && (
                <GermanCharAutocomplete
                  textareaRef={{ current: inputRef }}
                  content={userAnswer}
                  onContentChange={(value) => onAnswerChange(sentenceIndex, value)}
                />
              )}
              {isIncorrect && (
                <span className="inline-flex items-center justify-center px-1.5 py-1 bg-piku-mint text-gray-900 text-sm font-bold rounded-r-md">
                  {part.content}
                </span>
              )}
            </span>
          );
        }
      })}
    </div>
  );
}

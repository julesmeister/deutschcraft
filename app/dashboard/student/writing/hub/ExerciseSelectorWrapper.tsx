import { TranslationExerciseSelector } from "@/components/writing/TranslationExerciseSelector";
import { CreativeExerciseSelector } from "@/components/writing/CreativeExerciseSelector";
import { EmailTemplateSelector } from "@/components/writing/EmailTemplateSelector";
import { LetterTemplateSelector } from "@/components/writing/LetterTemplateSelector";
import {
  TranslationExercise,
  CreativeWritingExercise,
} from "@/lib/models/writing";
import { EmailTemplate } from "@/lib/data/emailTemplates";
import { LetterTemplate } from "@/lib/data/letterTemplates";

type ExerciseType = "translation" | "creative" | "email" | "letters" | "freestyle" | null;

interface ExerciseSelectorWrapperProps {
  selectedType: ExerciseType;
  translationExercises: TranslationExercise[];
  creativeExercises: CreativeWritingExercise[];
  emailTemplates: EmailTemplate[];
  letterTemplates: LetterTemplate[];
  attemptedExerciseIds: Set<string>;
  onTranslationSelect: (exercise: TranslationExercise) => void;
  onCreativeSelect: (exercise: CreativeWritingExercise) => void;
  onEmailSelect: (template: EmailTemplate) => void;
  onLetterSelect: (template: LetterTemplate) => void;
}

export function ExerciseSelectorWrapper({
  selectedType,
  translationExercises,
  creativeExercises,
  emailTemplates,
  letterTemplates,
  attemptedExerciseIds,
  onTranslationSelect,
  onCreativeSelect,
  onEmailSelect,
  onLetterSelect,
}: ExerciseSelectorWrapperProps) {
  if (selectedType === "translation") {
    return (
      <div className="mt-8">
        <TranslationExerciseSelector
          exercises={translationExercises}
          onSelect={onTranslationSelect}
          attemptedExerciseIds={attemptedExerciseIds}
        />
      </div>
    );
  }

  if (selectedType === "creative") {
    return (
      <div className="mt-8">
        <CreativeExerciseSelector
          exercises={creativeExercises}
          onSelect={onCreativeSelect}
          attemptedExerciseIds={attemptedExerciseIds}
        />
      </div>
    );
  }

  if (selectedType === "email") {
    return (
      <div className="mt-8">
        <EmailTemplateSelector
          templates={emailTemplates}
          onSelect={onEmailSelect}
          attemptedExerciseIds={attemptedExerciseIds}
        />
      </div>
    );
  }

  if (selectedType === "letters") {
    return (
      <div className="mt-8">
        <LetterTemplateSelector
          templates={letterTemplates}
          onSelect={onLetterSelect}
          attemptedExerciseIds={attemptedExerciseIds}
        />
      </div>
    );
  }

  return null;
}

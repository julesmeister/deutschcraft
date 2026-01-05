"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogButton, DialogFooter } from "../ui/Dialog";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Select, SelectOption } from "../ui/Select";
import { Edit3, FileText } from "lucide-react";
import { AnswerFieldsManager } from "./AnswerFieldsManager";
import { Exercise, ExerciseAnswer } from "@/lib/models/exercises";
import { CEFRLevel } from "@/lib/models/cefr";
import { CreateExerciseOverrideInput } from "@/lib/models/exerciseOverride";
import { GermanCharAutocomplete } from "@/components/writing/GermanCharAutocomplete";

interface ExerciseOverrideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (override: CreateExerciseOverrideInput) => Promise<void>;
  mode: "create" | "edit";
  exercise?: Exercise; // For edit mode
  level: CEFRLevel;
  bookType: "AB" | "KB";
  lessonNumber: number;
}

export function ExerciseOverrideDialog({
  isOpen,
  onClose,
  onSubmit,
  mode,
  exercise,
  level,
  bookType,
  lessonNumber,
}: ExerciseOverrideDialogProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [exerciseNumber, setExerciseNumber] = useState("");
  const [section, setSection] = useState("");
  const [topic, setTopic] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [answers, setAnswers] = useState<ExerciseAnswer[]>([
    { itemNumber: "1", correctAnswer: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for autocomplete
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLInputElement>(null);
  const topicRef = useRef<HTMLInputElement>(null);
  const exerciseNumberRef = useRef<HTMLInputElement>(null);

  // Populate form with initial data in edit mode
  useEffect(() => {
    if (isOpen && mode === "edit" && exercise) {
      setTitle(exercise.title || "");
      setQuestion(exercise.question || "");
      setExerciseNumber(exercise.exerciseNumber || "");
      setSection(exercise.section || "");
      setTopic(exercise.topic || "");
      setPageNumber(exercise.pageNumber?.toString() || "");
      setDifficulty(exercise.difficulty || "medium");
      setAnswers(
        exercise.answers.length > 0
          ? exercise.answers
          : [{ itemNumber: "1", correctAnswer: "" }]
      );
    } else if (isOpen && mode === "create") {
      // Reset to defaults for create mode
      setTitle("");
      setQuestion("");
      setExerciseNumber("");
      setSection("Übungen");
      setTopic("");
      setPageNumber("");
      setDifficulty("medium");
      setAnswers([{ itemNumber: "1", correctAnswer: "" }]);
    }
  }, [isOpen, mode, exercise]);

  const difficultyOptions: SelectOption[] = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  // Add new answer item
  const handleAddAnswer = () => {
    const nextNumber = (answers.length + 1).toString();
    setAnswers([...answers, { itemNumber: nextNumber, correctAnswer: "" }]);
  };

  // Remove answer item
  const handleRemoveAnswer = (index: number) => {
    if (answers.length === 1) return; // Keep at least one answer
    setAnswers(answers.filter((_, i) => i !== index));
  };

  // Update answer item
  const handleUpdateAnswer = (
    index: number,
    field: "itemNumber" | "correctAnswer",
    value: string
  ) => {
    const updated = [...answers];
    updated[index] = { ...updated[index], [field]: value };
    setAnswers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const override: CreateExerciseOverrideInput = {
        exerciseId:
          mode === "edit" && exercise
            ? exercise.exerciseId
            : `CUSTOM_${Date.now()}_${level}_${lessonNumber}`,
        overrideType: mode === "edit" ? "modify" : "create",
        teacherEmail: "", // Will be set by parent component
        ...(mode === "create"
          ? {
              // Create: Full exercise data
              exerciseData: {
                exerciseId: `CUSTOM_${Date.now()}_${level}_${lessonNumber}`,
                level,
                bookType,
                lessonNumber,
                exerciseNumber: exerciseNumber || `Custom-${Date.now()}`,
                title,
                question: question || undefined,
                section: section || undefined,
                topic: topic || undefined,
                pageNumber: pageNumber ? parseInt(pageNumber) : undefined,
                difficulty,
                answers: answers.filter((a) => a.correctAnswer.trim() !== ""),
              },
            }
          : {
              // Edit: Only modifications
              modifications: {
                title,
                question: question || undefined,
                exerciseNumber: exerciseNumber || undefined,
                section: section || undefined,
                topic: topic || undefined,
                pageNumber: pageNumber ? parseInt(pageNumber) : undefined,
                difficulty,
                answers: answers.filter((a) => a.correctAnswer.trim() !== ""),
              },
            }),
      };

      await onSubmit(override);
      onClose();

      // Reset form
      setTitle("");
      setQuestion("");
      setExerciseNumber("");
      setSection("");
      setTopic("");
      setPageNumber("");
      setDifficulty("medium");
      setAnswers([{ itemNumber: "1", correctAnswer: "" }]);
    } catch (error) {
      console.error("Error submitting exercise override:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} size="xl">
      <div className="-mt-6 -mx-6 -mb-6">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-piku-purple flex items-center justify-center">
              {mode === "edit" ? (
                <Edit3 className="w-5 h-5 text-white" />
              ) : (
                <FileText className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {mode === "edit" ? "Edit Exercise" : "Create Custom Exercise"}
              </h2>
              <p className="text-gray-400 text-sm">
                {mode === "edit"
                  ? "Modify exercise for all your students"
                  : `Custom exercise for ${level} - Lesson ${lessonNumber}`}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <FormField>
              <Label htmlFor="exercise-title">Exercise Title *</Label>
              <div className="relative">
                <Input
                  ref={titleRef}
                  id="exercise-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., A1a - Fill in the blanks"
                  required
                />
                <GermanCharAutocomplete
                  textareaRef={titleRef}
                  content={title}
                  onContentChange={setTitle}
                />
              </div>
            </FormField>

            {/* Two-column layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Exercise Number */}
              <FormField>
                <Label htmlFor="exercise-number">Exercise Number</Label>
                <div className="relative">
                  <Input
                    ref={exerciseNumberRef}
                    id="exercise-number"
                    type="text"
                    value={exerciseNumber}
                    onChange={(e) => setExerciseNumber(e.target.value)}
                    placeholder="e.g., 1a, 2b"
                  />
                  <GermanCharAutocomplete
                    textareaRef={exerciseNumberRef}
                    content={exerciseNumber}
                    onContentChange={setExerciseNumber}
                  />
                </div>
              </FormField>

              {/* Difficulty */}
              <FormField>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  id="difficulty"
                  value={difficulty}
                  onChange={(value) =>
                    setDifficulty(value as "easy" | "medium" | "hard")
                  }
                  options={difficultyOptions}
                />
              </FormField>
            </div>

            {/* Section and Topic */}
            <div className="grid grid-cols-2 gap-4">
              <FormField>
                <Label htmlFor="section">Section</Label>
                <div className="relative">
                  <Input
                    ref={sectionRef}
                    id="section"
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g., Schritt A"
                  />
                  <GermanCharAutocomplete
                    textareaRef={sectionRef}
                    content={section}
                    onContentChange={setSection}
                  />
                </div>
              </FormField>

              <FormField>
                <Label htmlFor="topic">Topic</Label>
                <div className="relative">
                  <Input
                    ref={topicRef}
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Verben, Grammatik"
                  />
                  <GermanCharAutocomplete
                    textareaRef={topicRef}
                    content={topic}
                    onContentChange={setTopic}
                  />
                </div>
              </FormField>
            </div>

            {/* Page Number */}
            <FormField>
              <Label htmlFor="page-number">Page Number</Label>
              <Input
                id="page-number"
                type="number"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                placeholder="e.g., 42"
                className="w-32"
              />
            </FormField>

            {/* Question */}
            <FormField>
              <Label htmlFor="question">Question / Instructions</Label>
              <div className="relative">
                <textarea
                  ref={questionRef}
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Optional question or instructions..."
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-piku-purple focus:border-transparent transition-all duration-150 resize-none"
                  rows={3}
                />
                <GermanCharAutocomplete
                  textareaRef={questionRef}
                  content={question}
                  onContentChange={setQuestion}
                />
              </div>
            </FormField>

            {/* Answers Section */}
            <div className="border-t pt-4">
              <AnswerFieldsManager
                answers={answers}
                onUpdateAnswer={handleUpdateAnswer}
                onAddAnswer={handleAddAnswer}
                onRemoveAnswer={handleRemoveAnswer}
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <DialogButton
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </DialogButton>
              <DialogButton
                variant="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "edit"
                  ? "Save Changes"
                  : "Create Exercise"}
              </DialogButton>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

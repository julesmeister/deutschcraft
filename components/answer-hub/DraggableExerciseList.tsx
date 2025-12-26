'use client';

import { useState, ReactNode } from 'react';
import { ExerciseWithOverrideMetadata } from '@/lib/models/exerciseOverride';

interface DraggableExerciseListProps {
  exercises: ExerciseWithOverrideMetadata[];
  onReorder: (reorderedExercises: ExerciseWithOverrideMetadata[]) => void;
  onEdit: (exercise: ExerciseWithOverrideMetadata) => void;
  onToggleHide: (exerciseId: string, isHidden: boolean) => void;
  renderExercise: (exercise: ExerciseWithOverrideMetadata) => ReactNode;
  isTeacher?: boolean;
}

/**
 * Draggable exercise list for teachers
 * Uses native HTML5 drag-and-drop API (no external dependencies)
 */
export function DraggableExerciseList({
  exercises,
  onReorder,
  onEdit,
  onToggleHide,
  renderExercise,
  isTeacher = false,
}: DraggableExerciseListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Only enable drag-and-drop for teachers
  if (!isTeacher) {
    return (
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <div key={exercise.exerciseId}>
            {renderExercise(exercise)}
          </div>
        ))}
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Prevent link navigation during drag
    const link = e.currentTarget.querySelector('a');
    if (link) {
      link.setAttribute('data-dragging', 'true');
    }

    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);

    // Add drag image styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Re-enable link navigation
    const link = e.currentTarget.querySelector('a');
    if (link) {
      link.removeAttribute('data-dragging');
    }

    // Reset styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're leaving the container, not a child
    if (e.currentTarget === e.target) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    // Reorder exercises
    const reordered = [...exercises];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, removed);

    onReorder(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {exercises.map((exercise, index) => {
        const isDragging = draggedIndex === index;
        const isOver = dragOverIndex === index;

        return (
          <div
            key={exercise.exerciseId}
            draggable={isTeacher}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              relative transition-all duration-200
              ${isDragging ? 'opacity-50 scale-95' : ''}
              ${isOver ? 'scale-105 ring-2 ring-piku-purple ring-offset-2' : ''}
            `}
          >
            {/* Exercise Content */}
            {renderExercise(exercise)}

            {/* Drag indicator line */}
            {isOver && draggedIndex !== null && draggedIndex < index && (
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-piku-purple" />
            )}
            {isOver && draggedIndex !== null && draggedIndex > index && (
              <div className="absolute -top-1 left-0 right-0 h-0.5 bg-piku-purple" />
            )}
          </div>
        );
      })}
    </div>
  );
}

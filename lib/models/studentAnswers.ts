/**
 * Student Answer Models
 * Tracks student responses to exercises
 */

/**
 * Marked Word
 * Represents a word marked by student for practice
 */
export interface MarkedWord {
  word: string;           // The marked word
  startIndex: number;     // Character position in studentAnswer
  endIndex: number;       // Character position (exclusive)
  markedAt: number;       // Timestamp when marked
}

/**
 * Student Answer Submission
 * Individual student's answer to a specific exercise item
 */
export interface StudentAnswerSubmission {
  studentId: string;              // User email or ID
  studentName: string;            // Display name
  exerciseId: string;             // Which exercise (e.g., "B1.1-L1-AB-Folge1-1")
  itemNumber: string;             // Which item (e.g., "1", "2", "a", "b")
  studentAnswer: string;          // What the student wrote
  submittedAt: number;            // Timestamp
  isCorrect?: boolean;            // Optional: if we want to auto-grade
  markedWords?: MarkedWord[];     // Optional: Words marked for practice
}

/**
 * Grouped student answers for display
 * Groups all answers from one student for one exercise
 */
export interface StudentExerciseAnswers {
  studentId: string;
  studentName: string;
  answers: {
    itemNumber: string;
    studentAnswer: string;
    submittedAt: number;
  }[];
}

/**
 * Helper: Group submissions by student
 */
export function groupAnswersByStudent(
  submissions: StudentAnswerSubmission[]
): StudentExerciseAnswers[] {
  const grouped = submissions.reduce((acc, submission) => {
    if (!acc[submission.studentId]) {
      acc[submission.studentId] = {
        studentId: submission.studentId,
        studentName: submission.studentName,
        answers: []
      };
    }
    acc[submission.studentId].answers.push({
      itemNumber: submission.itemNumber,
      studentAnswer: submission.studentAnswer,
      submittedAt: submission.submittedAt
    });
    return acc;
  }, {} as Record<string, StudentExerciseAnswers>);

  return Object.values(grouped).map(group => {
    // Sort answers by itemNumber using natural sort (handles "1", "2", "10" correctly)
    group.answers.sort((a, b) => 
      a.itemNumber.localeCompare(b.itemNumber, undefined, { numeric: true, sensitivity: 'base' })
    );
    return group;
  });
}

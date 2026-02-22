-- Playground Quiz Tables
-- Live quiz widget: teacher creates quiz sets, students answer with timers

CREATE TABLE IF NOT EXISTS playground_quizzes (
  quiz_id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_by TEXT NOT NULL,
  level TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS playground_quiz_questions (
  question_id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text',
  choices TEXT,
  correct_answer TEXT,
  time_limit INTEGER NOT NULL DEFAULT 60,
  FOREIGN KEY (quiz_id) REFERENCES playground_quizzes(quiz_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playground_quiz_answers (
  answer_id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct INTEGER,
  scored_by TEXT,
  scored_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES playground_quiz_questions(question_id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES playground_quizzes(quiz_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_room ON playground_quizzes(room_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions ON playground_quiz_questions(quiz_id, question_order);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON playground_quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user ON playground_quiz_answers(user_id, quiz_id);

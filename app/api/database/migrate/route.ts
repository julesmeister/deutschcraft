import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/turso/client";
import { adminDb } from "@/lib/firebaseAdmin";

/**
 * Direct migration from Firestore to Turso
 * POST /api/database/migrate
 *
 * Scopes:
 * - full: Migrate everything
 * - ai_reviews: Migrate writing submissions (AI corrections)
 * - users_names: Migrate user names
 * - batches: Migrate batches
 * - progress: Migrate writing progress, daily progress, review quizzes, and student answers
 *   (Note: Flashcard progress is currently commented out)
 *
 * IMPORTANT: This migration uses INSERT OR REPLACE to preserve existing Turso data.
 * Tables are NOT dropped, so running the migration multiple times is safe.
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a teacher (only teachers can perform migrations)
    const userDoc = await adminDb
      .collection("users")
      .doc(session.user.email)
      .get();
    const userData = userDoc.data();

    // TEMPORARY: Allow all users to migrate for recovery
    // if (userData?.role !== "TEACHER") {
    //   return NextResponse.json(
    //     { error: "Only teachers can migrate data" },
    //     { status: 403 }
    //   );
    // }

    // Parse request body for scope
    const body = await request.json().catch(() => ({}));
    const scope = body.scope || "ai_reviews";
    const logs: string[] = [];

    const log = (message: string) => {
      console.log(message);
      logs.push(message);
    };

    log(`[Migrate] Starting migration with scope: ${scope}`);

    // Disable foreign key constraints during migration
    await db.execute("PRAGMA foreign_keys = OFF");
    log("[Migrate] Foreign key constraints disabled");

    const stats: any = {
      writingSubmissions: 0,
      users: 0,
      batches: 0,
      progress: 0,
      flashcardProgress: 0,
      writingProgress: 0,
      writingStats: 0,
      reviewQuizzes: 0,
      studentAnswers: 0,
    };

    // --- TABLE CREATION (Ensure all tables exist) ---
    // NOTE: We do NOT drop tables to preserve existing Turso data
    // Using INSERT OR REPLACE will update existing records

    // writing_submissions
    await db.execute(`
      CREATE TABLE IF NOT EXISTS writing_submissions (
        submission_id TEXT PRIMARY KEY NOT NULL,
        exercise_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        exercise_type TEXT NOT NULL,
        exercise_title TEXT,
        level TEXT NOT NULL,
        attempt_number INTEGER DEFAULT 1,
        content TEXT,
        word_count INTEGER DEFAULT 0,
        character_count INTEGER DEFAULT 0,
        original_text TEXT,
        status TEXT DEFAULT 'draft',
        started_at INTEGER,
        submitted_at INTEGER,
        last_saved_at INTEGER,
        ai_feedback TEXT,
        ai_corrected_version TEXT,
        ai_corrected_at INTEGER,
        teacher_feedback TEXT,
        teacher_corrected_version TEXT,
        teacher_score INTEGER,
        reviewed_by TEXT,
        reviewed_at INTEGER,
        version INTEGER DEFAULT 1,
        previous_versions TEXT,
        is_public BOOLEAN DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
      )
    `);

    // teacher_reviews
    await db.execute(`
      CREATE TABLE IF NOT EXISTS teacher_reviews (
        review_id TEXT PRIMARY KEY NOT NULL,
        submission_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        review_text TEXT,
        score INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
      )
    `);

    // mini_exercise_sentences
    await db.execute(`
      CREATE TABLE IF NOT EXISTS mini_exercise_sentences (
        sentence_id TEXT PRIMARY KEY NOT NULL,
        submission_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        sentence TEXT NOT NULL,
        original_sentence TEXT NOT NULL,
        sentence_index INTEGER NOT NULL,
        exercise_id TEXT NOT NULL,
        exercise_type TEXT NOT NULL,
        exercise_title TEXT,
        source_type TEXT NOT NULL,
        submitted_at INTEGER NOT NULL,
        times_shown INTEGER DEFAULT 0,
        times_completed INTEGER DEFAULT 0,
        total_correct_answers INTEGER DEFAULT 0,
        total_blanks INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        average_accuracy REAL DEFAULT 0,
        consecutive_correct INTEGER DEFAULT 0,
        needs_review BOOLEAN DEFAULT 0,
        last_shown_at INTEGER,
        last_completed_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
      )
    `);

    // batches
    await db.execute(`
      CREATE TABLE IF NOT EXISTS batches (
        batch_id TEXT PRIMARY KEY NOT NULL,
        teacher_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        current_level TEXT NOT NULL CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
        is_active BOOLEAN DEFAULT true,
        start_date INTEGER NOT NULL,
        end_date INTEGER,
        student_count INTEGER DEFAULT 0,
        level_history TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    // progress (Daily study stats)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS progress (
        progress_id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        words_studied INTEGER DEFAULT 0,
        words_correct INTEGER DEFAULT 0,
        words_incorrect INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        sessions_completed INTEGER DEFAULT 0,
        cards_reviewed INTEGER DEFAULT 0,
        sentences_created INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    // flashcard_progress (Per-card stats)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS flashcard_progress (
        id TEXT PRIMARY KEY NOT NULL,
        flashcard_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        word_id TEXT NOT NULL,
        repetitions INTEGER DEFAULT 0,
        ease_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 1,
        next_review_date INTEGER,
        correct_count INTEGER DEFAULT 0,
        incorrect_count INTEGER DEFAULT 0,
        last_review_date INTEGER,
        mastery_level INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        level TEXT,
        state TEXT DEFAULT 'new',
        consecutive_correct INTEGER DEFAULT 0,
        consecutive_incorrect INTEGER DEFAULT 0,
        lapse_count INTEGER DEFAULT 0,
        last_lapse_date INTEGER,
        first_seen_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    // writing_progress (Daily writing stats)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS writing_progress (
        progress_id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        exercises_completed INTEGER DEFAULT 0,
        translations_completed INTEGER DEFAULT 0,
        creative_writings_completed INTEGER DEFAULT 0,
        total_words_written INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        average_grammar_score REAL DEFAULT 0,
        average_vocabulary_score REAL DEFAULT 0,
        average_overall_score REAL DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    // writing_stats (Overall writing stats)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS writing_stats (
        user_id TEXT PRIMARY KEY NOT NULL,
        total_exercises_completed INTEGER DEFAULT 0,
        total_translations INTEGER DEFAULT 0,
        total_creative_writings INTEGER DEFAULT 0,
        total_words_written INTEGER DEFAULT 0,
        total_time_spent INTEGER DEFAULT 0,
        average_grammar_score REAL DEFAULT 0,
        average_vocabulary_score REAL DEFAULT 0,
        average_coherence_score REAL DEFAULT 0,
        average_overall_score REAL DEFAULT 0,
        exercises_by_level TEXT,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_practice_date TEXT,
        recent_scores TEXT,
        updated_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    // --- MIGRATION LOGIC ---

    // 1. AI Reviews (writing-submissions)
    if (scope === "full" || scope === "ai_reviews") {
      log("[Migrate] Migrating writing-submissions (AI Corrections)...");

      const writingSubmissionsSnapshot = await adminDb
        .collection("writing-submissions")
        .get();
      const legacyWritingSubmissionsSnapshot = await adminDb
        .collection("writingSubmissions")
        .get();

      log(
        `[Migrate] Found ${writingSubmissionsSnapshot.size} documents in writing-submissions`
      );

      let writingSubmissionCount = 0;

      const processSubmission = async (doc: any) => {
        const submission = doc.data();
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO writing_submissions (
            submission_id, exercise_id, user_id, exercise_type, exercise_title, level,
            attempt_number, content, word_count, character_count, original_text,
            status, started_at, submitted_at, last_saved_at,
            ai_feedback, ai_corrected_version, ai_corrected_at,
            teacher_feedback, teacher_corrected_version, teacher_score, reviewed_by, reviewed_at,
            version, previous_versions, is_public,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              submission.submissionId || doc.id,
              submission.exerciseId,
              submission.userId,
              submission.exerciseType,
              submission.exerciseTitle || null,
              submission.level,
              submission.attemptNumber || 1,
              submission.content,
              submission.wordCount || 0,
              submission.characterCount || 0,
              submission.originalText || null,
              submission.status || "draft",
              submission.startedAt,
              submission.submittedAt || null,
              submission.lastSavedAt,
              submission.aiFeedback
                ? JSON.stringify(submission.aiFeedback)
                : null,
              submission.aiCorrectedVersion || null,
              submission.aiCorrectedAt || null,
              submission.teacherFeedback || null,
              submission.teacherCorrectedVersion || null,
              submission.teacherScore || null,
              submission.reviewedBy || null,
              submission.reviewedAt || submission.aiCorrectedAt || null,
              submission.version || 1,
              submission.previousVersions
                ? JSON.stringify(submission.previousVersions)
                : null,
              submission.isPublic || false,
              submission.createdAt || Date.now(),
              submission.updatedAt || Date.now(),
            ],
          });
          writingSubmissionCount++;
        } catch (error) {
          console.error(
            `[Migrate] Error migrating writing submission ${submission.submissionId}:`,
            error
          );
        }
      };

      for (const doc of writingSubmissionsSnapshot.docs)
        await processSubmission(doc);
      for (const doc of legacyWritingSubmissionsSnapshot.docs)
        await processSubmission(doc);

      stats.writingSubmissions = writingSubmissionCount;
    }

    // 2. Users (Names & Info)
    if (scope === "full" || scope === "users_names") {
      log("[Migrate] Migrating users (Names)...");
      const usersSnapshot = await adminDb.collection("users").get();
      log(`[Migrate] Found ${usersSnapshot.size} users to migrate`);

      let userCount = 0;
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        const userId = doc.id;
        const firstName = userData.firstName || "";
        const lastName = userData.lastName || "";
        let finalFirstName = firstName;
        let finalLastName = lastName;

        if (!finalFirstName && !finalLastName && userData.name) {
          const parts = userData.name.split(" ");
          finalFirstName = parts[0] || "";
          finalLastName = parts.slice(1).join(" ") || "";
        }

        try {
          const now = Date.now();
          await db.execute({
            sql: `INSERT INTO users (
                user_id, email, first_name, last_name, role, photo_url, enrollment_status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(user_id) DO UPDATE SET
                first_name = excluded.first_name,
                last_name = excluded.last_name,
                updated_at = excluded.updated_at`,
            args: [
              userId,
              userData.email || userId,
              finalFirstName,
              finalLastName,
              userData.role || "STUDENT",
              userData.photoURL || null,
              userData.enrollmentStatus || "not_submitted",
              userData.createdAt || now,
              now,
            ],
          });
          userCount++;
        } catch (e) {
          log(`[Migrate] Error migrating user ${userId}: ${e}`);
        }
      }
      stats.users = userCount;
      log(`[Migrate] Processed ${userCount} users`);
    }

    // 3. Batches
    if (scope === "full" || scope === "batches") {
      log("[Migrate] Migrating batches...");
      const batchesSnapshot = await adminDb.collection("batches").get();
      log(`[Migrate] Found ${batchesSnapshot.size} batches to migrate`);

      let batchCount = 0;
      for (const doc of batchesSnapshot.docs) {
        const batchData = doc.data();
        const batchId = doc.id;

        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO batches (
              batch_id, teacher_id, name, description, current_level, 
              is_active, start_date, end_date, student_count, level_history,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              batchId,
              batchData.teacherId || "zoom.flux@gmail.com",
              batchData.name,
              batchData.description || "",
              batchData.currentLevel || batchData.level || "A1",
              batchData.isActive === false ? 0 : 1,
              batchData.startDate || Date.now(),
              batchData.endDate || null,
              batchData.studentCount || 0,
              batchData.levelHistory
                ? JSON.stringify(batchData.levelHistory)
                : "[]",
              batchData.createdAt || Date.now(),
              batchData.updatedAt || Date.now(),
            ],
          });
          batchCount++;
          log(`[Migrate] Migrated batch: ${batchData.name} (${batchId})`);
        } catch (e) {
          log(`[Migrate] Error migrating batch ${batchId}: ${e}`);
        }
      }
      stats.batches = batchCount;
      log(`[Migrate] Processed ${batchCount} batches`);
    }

    // 4. Progress (Daily Stats & Flashcards)
    if (scope === "full" || scope === "progress") {
      log("[Migrate] Starting progress migration...");

      // 4.1 Daily Progress
      const progressSnapshot = await adminDb.collection("progress").get();
      log(
        `[Migrate] Found ${progressSnapshot.size} daily progress records in Firestore`
      );

      let progressCount = 0;
      for (const doc of progressSnapshot.docs) {
        const data = doc.data();
        const progressId = doc.id; // e.g. PROG_20251110_zoom.flux@gmail.com

        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO progress (
              progress_id, user_id, date, words_studied, words_correct, 
              words_incorrect, time_spent, sessions_completed, cards_reviewed, 
              sentences_created, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              progressId,
              data.userId,
              data.date,
              data.wordsStudied || 0,
              data.wordsCorrect || 0,
              data.wordsIncorrect || 0,
              data.timeSpent || 0,
              data.sessionsCompleted || 0,
              data.cardsReviewed || 0,
              data.sentencesCreated || 0,
              data.createdAt || Date.now(),
            ],
          });
          progressCount++;
        } catch (error) {
          log(`[Migrate] Error migrating progress ${progressId}: ${error}`);
        }
      }
      stats.progress = progressCount;
      log(`[Migrate] Migrated ${progressCount} daily progress records`);

      // 4.2 Flashcard Progress (COMMENTED OUT - focusing on writing data only)
      // const fpSnapshot = await adminDb.collection("flashcard-progress").get();
      // log(
      //   `[Migrate] Found ${fpSnapshot.size} flashcard progress records in Firestore`
      // );

      // let fpCount = 0;
      // for (const doc of fpSnapshot.docs) {
      //   const data = doc.data();
      //   const id = doc.id;

      //   try {
      //     await db.execute({
      //       sql: `INSERT OR REPLACE INTO flashcard_progress (
      //         id, flashcard_id, user_id, word_id, repetitions, ease_factor,
      //         interval, next_review_date, correct_count, incorrect_count,
      //         last_review_date, mastery_level, created_at, updated_at,
      //         level, state, consecutive_correct, consecutive_incorrect,
      //         lapse_count, last_lapse_date, first_seen_at
      //       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      //       args: [
      //         id,
      //         data.flashcardId,
      //         data.userId,
      //         data.wordId,
      //         data.repetitions || 0,
      //         data.easeFactor || 2.5,
      //         data.interval || 1,
      //         data.nextReviewDate || null,
      //         data.correctCount || 0,
      //         data.incorrectCount || 0,
      //         data.lastReviewDate || null,
      //         data.masteryLevel || 0,
      //         data.createdAt || Date.now(),
      //         data.updatedAt || Date.now(),
      //         data.level || null,
      //         data.state || "new",
      //         data.consecutiveCorrect || 0,
      //         data.consecutiveIncorrect || 0,
      //         data.lapseCount || 0,
      //         data.lastLapseDate || null,
      //         data.firstSeenAt || null,
      //       ],
      //     });
      //     fpCount++;
      //   } catch (error) {
      //     log(`[Migrate] Error migrating flashcard progress ${id}: ${error}`);
      //   }
      // }
      // stats.flashcardProgress = fpCount;
      // log(`[Migrate] Migrated ${fpCount} flashcard progress records`);
      stats.flashcardProgress = 0; // Skipped for now

      // 5. Writing Submissions (needed for review quizzes foreign keys)
      log("[Migrate] Migrating writing submissions for foreign key dependencies...");

      const writingSubmissionsSnapshot = await adminDb
        .collection("writing-submissions")
        .get();
      const legacyWritingSubmissionsSnapshot = await adminDb
        .collection("writingSubmissions")
        .get();

      log(
        `[Migrate] Found ${writingSubmissionsSnapshot.size + legacyWritingSubmissionsSnapshot.size} writing submissions`
      );

      let writingSubmissionCount = 0;

      const processSubmission = async (doc: any) => {
        const submission = doc.data();
        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO writing_submissions (
            submission_id, exercise_id, user_id, exercise_type, exercise_title, level,
            attempt_number, content, word_count, character_count, original_text,
            status, started_at, submitted_at, last_saved_at,
            ai_feedback, ai_corrected_version, ai_corrected_at,
            teacher_feedback, teacher_corrected_version, teacher_score, reviewed_by, reviewed_at,
            version, previous_versions, is_public,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              submission.submissionId || doc.id,
              submission.exerciseId,
              submission.userId,
              submission.exerciseType,
              submission.exerciseTitle || null,
              submission.level,
              submission.attemptNumber || 1,
              submission.content,
              submission.wordCount || 0,
              submission.characterCount || 0,
              submission.originalText || null,
              submission.status || "draft",
              submission.startedAt,
              submission.submittedAt || null,
              submission.lastSavedAt,
              submission.aiFeedback
                ? JSON.stringify(submission.aiFeedback)
                : null,
              submission.aiCorrectedVersion || null,
              submission.aiCorrectedAt || null,
              submission.teacherFeedback || null,
              submission.teacherCorrectedVersion || null,
              submission.teacherScore || null,
              submission.reviewedBy || null,
              submission.reviewedAt || submission.aiCorrectedAt || null,
              submission.version || 1,
              submission.previousVersions
                ? JSON.stringify(submission.previousVersions)
                : null,
              submission.isPublic || false,
              submission.createdAt || Date.now(),
              submission.updatedAt || Date.now(),
            ],
          });
          writingSubmissionCount++;
        } catch (error) {
          console.error(
            `[Migrate] Error migrating writing submission ${submission.submissionId}:`,
            error
          );
        }
      };

      for (const doc of writingSubmissionsSnapshot.docs)
        await processSubmission(doc);
      for (const doc of legacyWritingSubmissionsSnapshot.docs)
        await processSubmission(doc);

      stats.writingSubmissions = writingSubmissionCount;
      log(`[Migrate] Migrated ${writingSubmissionCount} writing submissions`);

      // 6. Writing Progress (Daily Stats & Overall Stats)
      log("[Migrate] Starting writing progress migration...");

      // 6.1 Daily Writing Progress
      const writingProgressSnapshot = await adminDb
        .collection("writing-progress")
        .get();
      log(
        `[Migrate] Found ${writingProgressSnapshot.size} daily writing progress records in Firestore`
      );

      let writingProgressCount = 0;
      for (const doc of writingProgressSnapshot.docs) {
        const data = doc.data();
        const progressId = doc.id; // e.g. WPROG_20251110_zoom.flux@gmail.com

        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO writing_progress (
              progress_id, user_id, date, exercises_completed, translations_completed,
              creative_writings_completed, total_words_written, time_spent,
              average_grammar_score, average_vocabulary_score, average_overall_score,
              current_streak, longest_streak, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              progressId,
              data.userId,
              data.date,
              data.exercisesCompleted || 0,
              data.translationsCompleted || 0,
              data.creativeWritingsCompleted || 0,
              data.totalWordsWritten || 0,
              data.timeSpent || 0,
              data.averageGrammarScore || 0,
              data.averageVocabularyScore || 0,
              data.averageOverallScore || 0,
              data.currentStreak || 0,
              data.longestStreak || 0,
              data.createdAt || Date.now(),
              data.updatedAt || Date.now(),
            ],
          });
          writingProgressCount++;
        } catch (error) {
          log(
            `[Migrate] Error migrating writing progress ${progressId}: ${error}`
          );
        }
      }
      stats.writingProgress = writingProgressCount;
      log(
        `[Migrate] Migrated ${writingProgressCount} daily writing progress records`
      );

      // 6.2 Overall Writing Stats
      const writingStatsSnapshot = await adminDb
        .collection("writing-stats")
        .get();
      log(
        `[Migrate] Found ${writingStatsSnapshot.size} overall writing stats records in Firestore`
      );

      let writingStatsCount = 0;
      for (const doc of writingStatsSnapshot.docs) {
        const data = doc.data();
        const userId = doc.id;

        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO writing_stats (
              user_id, total_exercises_completed, total_translations,
              total_creative_writings, total_words_written, total_time_spent,
              average_grammar_score, average_vocabulary_score, average_coherence_score,
              average_overall_score, exercises_by_level, current_streak,
              longest_streak, last_practice_date, recent_scores, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              userId,
              data.totalExercisesCompleted || 0,
              data.totalTranslations || 0,
              data.totalCreativeWritings || 0,
              data.totalWordsWritten || 0,
              data.totalTimeSpent || 0,
              data.averageGrammarScore || 0,
              data.averageVocabularyScore || 0,
              data.averageCoherenceScore || 0,
              data.averageOverallScore || 0,
              JSON.stringify(data.exercisesByLevel) || "{}",
              data.currentStreak || 0,
              data.longestStreak || 0,
              data.lastPracticeDate || null,
              JSON.stringify(data.recentScores) || "[]",
              data.updatedAt || Date.now(),
            ],
          });
          writingStatsCount++;
        } catch (error) {
          log(`[Migrate] Error migrating writing stats ${userId}: ${error}`);
        }
      }
      stats.writingStats = writingStatsCount;
      log(
        `[Migrate] Migrated ${writingStatsCount} overall writing stats records`
      );

      // 6.3 Writing Review Quizzes
      const reviewQuizzesSnapshot = await adminDb
        .collection("writing-review-quizzes")
        .get();
      log(
        `[Migrate] Found ${reviewQuizzesSnapshot.size} writing review quizzes in Firestore`
      );

      let quizCount = 0;
      for (const doc of reviewQuizzesSnapshot.docs) {
        const data = doc.data();
        const quizId = doc.id;

        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO writing_review_quizzes (
              quiz_id, submission_id, user_id, exercise_id, exercise_type,
              source_type, original_text, corrected_text, blanks, answers,
              score, correct_answers, total_blanks, status,
              started_at, completed_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              quizId,
              data.submissionId,
              data.userId,
              data.exerciseId,
              data.exerciseType || "creative",
              data.sourceType || "ai",
              data.originalText || "",
              data.correctedText || "",
              data.blanks ? JSON.stringify(data.blanks) : "[]",
              data.answers ? JSON.stringify(data.answers) : "{}",
              data.score || 0,
              data.correctAnswers || 0,
              data.totalBlanks || 0,
              data.status || "in-progress",
              data.startedAt || Date.now(),
              data.completedAt || null,
              data.createdAt || Date.now(),
              data.updatedAt || Date.now(),
            ],
          });
          quizCount++;
        } catch (error) {
          log(`[Migrate] Error migrating review quiz ${quizId}: ${error}`);
        }
      }
      stats.reviewQuizzes = quizCount;
      log(`[Migrate] Migrated ${quizCount} writing review quizzes`);

      // 6.4 Student Answers
      const studentAnswersSnapshot = await adminDb
        .collection("studentAnswers")
        .get();
      log(
        `[Migrate] Found ${studentAnswersSnapshot.size} student answers in Firestore`
      );

      let answerCount = 0;
      for (const doc of studentAnswersSnapshot.docs) {
        const data = doc.data();
        const answerId = doc.id;

        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO student_answers (
              answer_id, student_id, student_name, exercise_id, item_number,
              student_answer, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [
              answerId,
              data.studentId,
              data.studentName || "",
              data.exerciseId,
              data.itemNumber,
              data.studentAnswer,
              data.submittedAt || Date.now(),
            ],
          });
          answerCount++;
        } catch (error) {
          log(`[Migrate] Error migrating student answer ${answerId}: ${error}`);
        }
      }
      stats.studentAnswers = answerCount;
      log(`[Migrate] Migrated ${answerCount} student answers`);
    }

    // Re-enable foreign key constraints
    await db.execute("PRAGMA foreign_keys = ON");
    log("[Migrate] Foreign key constraints re-enabled");

    log("[Migrate] Completed successfully");

    return NextResponse.json({
      success: true,
      stats,
      logs,
    });
  } catch (error) {
    console.error("[Migrate] Error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    try {
      await db.execute("PRAGMA foreign_keys = ON");
    } catch (e) {}
    return NextResponse.json(
      { error: "Failed to migrate data", details: errMsg, logs: [] },
      { status: 500 }
    );
  }
}

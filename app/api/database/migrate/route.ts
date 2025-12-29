import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/turso/client";
import { adminDb } from "@/lib/firebaseAdmin";

/**
 * Direct migration from Firestore to Turso
 * POST /api/database/migrate
 *
 * Simplified to focus on AI corrections migration (writing-submissions).
 * Other tables are assumed to be already migrated.
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

    if (userData?.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Only teachers can migrate data" },
        { status: 403 }
      );
    }

    // Parse request body for scope
    const body = await request.json().catch(() => ({}));
    const scope = body.scope || "ai_reviews"; // Default to ai_reviews as per user request
    console.log(`[Migrate] Starting migration with scope: ${scope}`);

    // Disable foreign key constraints during migration
    await db.execute("PRAGMA foreign_keys = OFF");
    console.log("[Migrate] Foreign key constraints disabled");

    const stats: any = {
      writingSubmissions: 0,
    };

    // Create writing_submissions table if not exists (Critical for AI corrections)
    // Drop first to ensure schema update
    await db.execute("DROP TABLE IF EXISTS writing_submissions");
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

    // Create teacher_reviews table if not exists (Related to reviews)
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

    // Create mini_exercise_sentences table if not exists (Critical for mini exercises)
    // Drop first to ensure schema update
    await db.execute("DROP TABLE IF EXISTS mini_exercise_sentences");
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

    // Always migrate writing-submissions if scope is 'full' or 'ai_reviews'
    // This contains the AI corrections
    if (scope === "full" || scope === "ai_reviews") {
      console.log(
        "[Migrate] Migrating writing-submissions (AI Corrections)..."
      );

      // 1. Fetch from main collection 'writing-submissions'
      const writingSubmissionsSnapshot = await adminDb
        .collection("writing-submissions")
        .get();

      // 2. Fetch from legacy collection 'writingSubmissions'
      const legacyWritingSubmissionsSnapshot = await adminDb
        .collection("writingSubmissions")
        .get();

      console.log(
        `[Migrate] Found ${writingSubmissionsSnapshot.size} documents in writing-submissions`
      );

      let writingSubmissionCount = 0;

      // Helper function to process submissions
      const processSubmission = async (doc: any) => {
        const submission = doc.data();

        try {
          await db.execute({
            sql: `INSERT OR REPLACE INTO writing_submissions (
            submission_id, exercise_id, user_id, exercise_type, exercise_title, level,
            attempt_number,
            content, word_count, character_count,
            original_text,
            status,
            started_at, submitted_at, last_saved_at,
            ai_feedback,
            ai_corrected_version,
            ai_corrected_at,
            teacher_feedback, teacher_corrected_version, teacher_score, reviewed_by, reviewed_at,
            version, previous_versions, is_public,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

      // Process both collections
      for (const doc of writingSubmissionsSnapshot.docs) {
        await processSubmission(doc);
      }

      for (const doc of legacyWritingSubmissionsSnapshot.docs) {
        await processSubmission(doc);
      }

      stats.writingSubmissions = writingSubmissionCount;
    }

    // Re-enable foreign key constraints
    await db.execute("PRAGMA foreign_keys = ON");
    console.log("[Migrate] Foreign key constraints re-enabled");

    console.log("[Migrate] Completed successfully:", stats);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("[Migrate] Error:", error);

    // Re-enable foreign keys even on error
    try {
      await db.execute("PRAGMA foreign_keys = ON");
    } catch (pragmaError) {
      console.error("[Migrate] Failed to re-enable foreign keys:", pragmaError);
    }

    return NextResponse.json(
      {
        error: "Failed to migrate data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

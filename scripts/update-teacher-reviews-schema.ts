import { db } from "../turso/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function migrateSchema() {
  console.log("Starting schema migration for teacher_reviews...");
  
  try {
    // 1. Rename existing table
    console.log("Renaming existing table...");
    await db.execute("ALTER TABLE teacher_reviews RENAME TO teacher_reviews_old");

    // 2. Create new table
    console.log("Creating new table...");
    await db.execute(`
      CREATE TABLE teacher_reviews (
        review_id TEXT PRIMARY KEY,
        submission_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        grammar_score INTEGER,
        vocabulary_score INTEGER,
        coherence_score INTEGER,
        overall_score INTEGER,
        comments TEXT,
        corrected_version TEXT,
        strengths TEXT,
        areas_for_improvement TEXT,
        meets_criteria INTEGER DEFAULT 0,
        requires_revision INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (submission_id) REFERENCES writing_submissions(submission_id)
      )
    `);

    // 3. Migrate data
    console.log("Migrating data...");
    const oldData = await db.execute("SELECT * FROM teacher_reviews_old");
    
    for (const row of oldData.rows) {
      await db.execute({
        sql: `INSERT INTO teacher_reviews (
          review_id, submission_id, teacher_id, 
          overall_score, comments, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          row.review_id,
          row.submission_id,
          row.teacher_id,
          row.score,        // Map score -> overall_score
          row.review_text,  // Map review_text -> comments
          row.created_at,
          row.updated_at
        ]
      });
    }

    // 4. Drop old table (optional, maybe keep for safety for now? nah, let's clean up if successful)
    // Actually, let's keep it but rename it to backup just in case
    // await db.execute("DROP TABLE teacher_reviews_old");
    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Migration failed:", error);
    // Attempt to rollback if possible? SQLite doesn't have transactional DDL across multiple statements easily in this client maybe?
    // But we can manually revert if it failed at step 2 or 3.
    console.log("You may need to manually restore the table from teacher_reviews_old if it exists.");
  }
}

migrateSchema();

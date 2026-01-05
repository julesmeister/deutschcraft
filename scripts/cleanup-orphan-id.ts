/**
 * Cleanup Orphaned Old Format ID in Database
 * Removes the single remaining FLASH_syllabus-* record
 */

import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

async function cleanupOrphan() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log("🧹 Cleaning up orphaned old format IDs\n");

  // Find the orphaned record
  const oldRecords = await db.execute({
    sql: "SELECT id, flashcard_id, word_id, user_id FROM flashcard_progress WHERE flashcard_id LIKE 'syllabus-%' OR flashcard_id LIKE 'FLASH_%'",
    args: [],
  });

  if (oldRecords.rows.length === 0) {
    console.log("✅ No orphaned records found - database is clean!");
    return;
  }

  console.log(`Found ${oldRecords.rows.length} orphaned record(s):\n`);
  oldRecords.rows.forEach((row, i) => {
    console.log(`  ${i + 1}. ID: ${row.id}`);
    console.log(`     flashcard_id: ${row.flashcard_id}`);
    console.log(`     word_id: ${row.word_id}`);
    console.log(`     user_id: ${row.user_id}\n`);
  });

  // Delete orphaned records
  console.log("🗑️  Deleting orphaned records...");
  const deleteResult = await db.execute({
    sql: "DELETE FROM flashcard_progress WHERE flashcard_id LIKE 'syllabus-%' OR flashcard_id LIKE 'FLASH_%'",
    args: [],
  });

  console.log(`✅ Deleted ${oldRecords.rows.length} orphaned record(s)`);

  // Verify cleanup
  const remaining = await db.execute({
    sql: "SELECT COUNT(*) as count FROM flashcard_progress WHERE flashcard_id LIKE 'syllabus-%' OR flashcard_id LIKE 'FLASH_%'",
    args: [],
  });

  console.log(`\n📊 Verification:`);
  console.log(`   Remaining old format IDs: ${remaining.rows[0].count}`);

  if (Number(remaining.rows[0].count) === 0) {
    console.log("\n✅ Database cleanup complete!");
  } else {
    console.log("\n⚠️  Warning: Some old format IDs still remain");
  }
}

cleanupOrphan().catch(console.error);

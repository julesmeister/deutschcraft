import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

async function checkIds() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  console.log("=== FLASHCARD PROGRESS TABLE ===\n");

  // Count old format IDs
  const oldFormat = await db.execute(
    "SELECT COUNT(*) as count FROM flashcard_progress WHERE flashcard_id LIKE 'syllabus-%' OR flashcard_id LIKE 'FLASH_%'"
  );
  console.log(`Old format IDs (syllabus-* or FLASH_*): ${oldFormat.rows[0].count}`);

  // Count new format IDs
  const newFormat = await db.execute(
    "SELECT COUNT(*) as count FROM flashcard_progress WHERE flashcard_id LIKE 'a1-%' OR flashcard_id LIKE 'a2-%' OR flashcard_id LIKE 'b1-%' OR flashcard_id LIKE 'b2-%' OR flashcard_id LIKE 'c1-%' OR flashcard_id LIKE 'c2-%'"
  );
  console.log(`New format IDs (a1-*, a2-*, etc.): ${newFormat.rows[0].count}`);

  // Total count
  const total = await db.execute("SELECT COUNT(*) as count FROM flashcard_progress");
  console.log(`Total records: ${total.rows[0].count}`);

  // Sample old IDs
  console.log("\nSample OLD format IDs:");
  const oldSamples = await db.execute(
    "SELECT flashcard_id, word_id FROM flashcard_progress WHERE flashcard_id LIKE 'syllabus-%' OR flashcard_id LIKE 'FLASH_%' LIMIT 5"
  );
  oldSamples.rows.forEach((row, i) => {
    console.log(`  ${i + 1}. ${row.flashcard_id} (word_id: ${row.word_id})`);
  });

  // Sample new IDs
  console.log("\nSample NEW format IDs:");
  const newSamples = await db.execute(
    "SELECT flashcard_id, word_id FROM flashcard_progress WHERE flashcard_id LIKE 'a1-%' OR flashcard_id LIKE 'a2-%' OR flashcard_id LIKE 'b1-%' LIMIT 5"
  );
  newSamples.rows.forEach((row, i) => {
    console.log(`  ${i + 1}. ${row.flashcard_id} (word_id: ${row.word_id})`);
  });

  console.log("\n=== VOCABULARY TABLE ===\n");

  // Count old format word_ids
  const vocabOld = await db.execute(
    "SELECT COUNT(*) as count FROM vocabulary WHERE word_id LIKE 'syllabus-%' OR word_id LIKE 'FLASH_%'"
  );
  console.log(`Old format word_ids: ${vocabOld.rows[0].count}`);

  // Count new format word_ids
  const vocabNew = await db.execute(
    "SELECT COUNT(*) as count FROM vocabulary WHERE word_id LIKE 'a1-%' OR word_id LIKE 'a2-%' OR word_id LIKE 'b1-%' OR word_id LIKE 'b2-%' OR word_id LIKE 'c1-%' OR word_id LIKE 'c2-%'"
  );
  console.log(`New format word_ids: ${vocabNew.rows[0].count}`);

  const vocabTotal = await db.execute("SELECT COUNT(*) as count FROM vocabulary");
  console.log(`Total vocabulary records: ${vocabTotal.rows[0].count}`);
}

checkIds().catch(console.error);

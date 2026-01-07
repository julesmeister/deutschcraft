import * as dotenv from "dotenv";
import path from "path";

// Load environment variables before importing client
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "@/turso/client";
import { syncMarkedWordsProgress } from "@/lib/services/turso/markedWordProgressService";

async function main() {
  console.log("Starting Marked Word Progress Sync...");

  try {
    // 1. Get all answers with marked words
    const result = await db.execute({
      sql: `SELECT * FROM student_answers 
            WHERE marked_words IS NOT NULL 
            AND marked_words != '[]'
            AND marked_words != 'null'`,
      args: [],
    });

    console.log(`Found ${result.rows.length} answers with marked words.`);

    let count = 0;
    for (const row of result.rows) {
      try {
        const markedWordsStr = row.marked_words as string;
        if (!markedWordsStr) continue;

        const markedWords = JSON.parse(markedWordsStr);

        if (!Array.isArray(markedWords) || markedWords.length === 0) continue;

        const studentId = row.student_id as string;
        const exerciseId = row.exercise_id as string;
        const itemNumber = row.item_number as string;

        // Sync to create initial records
        await syncMarkedWordsProgress(
          studentId,
          exerciseId,
          itemNumber,
          markedWords
        );

        count++;
        if (count % 100 === 0) {
          console.log(`Processed ${count} answers...`);
        }
      } catch (err) {
        console.error(`Error processing row: ${err}`);
      }
    }

    console.log("Sync complete.");
  } catch (error) {
    console.error("Fatal error:", error);
  }
}

main().catch(console.error);

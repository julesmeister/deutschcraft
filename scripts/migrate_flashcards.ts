import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  console.log("Starting migration...");

  // Get all users
  const usersResult = await client.execute(
    "SELECT DISTINCT user_id FROM flashcard_progress"
  );
  const userIds = usersResult.rows.map((row) => row.user_id as string);

  console.log(`Found ${userIds.length} users.`);

  for (const userId of userIds) {
    console.log(`Processing user: ${userId}`);

    // Get all progress for user
    const result = await client.execute({
      sql: `SELECT id, flashcard_id, updated_at FROM flashcard_progress WHERE user_id = ?`,
      args: [userId],
    });

    const rows = result.rows;
    const processed = new Set<string>();
    let fixedCount = 0;
    let deletedCount = 0;

    // Map by suffix (stripped ID)
    const cardMap = new Map<string, any[]>();
    for (const row of rows) {
      let suffix = row.flashcard_id as string;
      if (suffix.startsWith("FLASH_")) {
        suffix = suffix.substring(6);
      }
      if (!cardMap.has(suffix)) {
        cardMap.set(suffix, []);
      }
      cardMap.get(suffix)?.push(row);
    }

    for (const [suffix, records] of cardMap.entries()) {
      // Find "Old" (no FLASH_) and "New" (FLASH_) records
      const oldRecord = records.find(
        (r) => !(r.flashcard_id as string).startsWith("FLASH_")
      );
      const newRecord = records.find((r) =>
        (r.flashcard_id as string).startsWith("FLASH_")
      );

      if (oldRecord && newRecord) {
        // Both exist. Delete the Old one (New one is likely more recent/correct).
        // Check timestamps just in case?
        // Assuming New is correct because app writes to it.
        console.log(`[DUPLICATE] Deleting old record for ${suffix}`);
        await client.execute({
          sql: `DELETE FROM flashcard_progress WHERE id = ?`,
          args: [oldRecord.id],
        });
        deletedCount++;
      } else if (oldRecord && !newRecord) {
        // Only Old exists. Rename it to New.
        // Needs to check if the suffix implies it SHOULD have FLASH_ (e.g. syllabus-)
        if (suffix.startsWith("syllabus-")) {
          console.log(`[MIGRATE] Renaming ${suffix} to FLASH_${suffix}`);
          const newId = `${userId}_FLASH_${suffix}`;
          const newFlashcardId = `FLASH_${suffix}`;

          // 1. Ensure FLASH_ entry exists in flashcards table
          // We copy from the old entry if FLASH_ entry doesn't exist
          try {
            // Check if FLASH_ exists
            const flashCheck = await client.execute({
              sql: "SELECT id FROM flashcards WHERE id = ?",
              args: [newFlashcardId],
            });

            if (flashCheck.rows.length === 0) {
              // Check if OLD exists
              const oldFlashCheck = await client.execute({
                sql: "SELECT * FROM flashcards WHERE id = ?",
                args: [suffix],
              });

              if (oldFlashCheck.rows.length === 0) {
                console.warn(
                  `  [WARNING] Source flashcard ${suffix} not found. Deleting orphaned progress record.`
                );
                await client.execute({
                  sql: "DELETE FROM flashcard_progress WHERE id = ?",
                  args: [oldRecord.id],
                });
                deletedCount++;
                continue; // Skip update
              }

              // Copy from old
              await client.execute({
                sql: `INSERT INTO flashcards (id, word_id, question, correct_answer, wrong_answers, type, level, created_at)
                          SELECT ?, word_id, question, correct_answer, wrong_answers, type, level, created_at
                          FROM flashcards WHERE id = ?`,
                args: [newFlashcardId, suffix],
              });
              console.log(`  Created flashcard entry: ${newFlashcardId}`);
            }
          } catch (e) {
            console.error(
              `  Error creating flashcard entry for ${newFlashcardId}:`,
              e
            );
            // If we failed to create flashcard (e.g. FK error on word_id), we probably can't update progress either.
            // Delete the progress record? Or just skip?
            // If it's FK error, the progress record is likely invalid too.
            if (String(e).includes("FOREIGN KEY")) {
              console.warn(
                `  [WARNING] FK Error creating flashcard. Deleting invalid progress record.`
              );
              await client.execute({
                sql: "DELETE FROM flashcard_progress WHERE id = ?",
                args: [oldRecord.id],
              });
              deletedCount++;
              continue;
            }
          }

          try {
            await client.execute({
              sql: `UPDATE flashcard_progress SET id = ?, flashcard_id = ? WHERE id = ?`,
              args: [newId, newFlashcardId, oldRecord.id],
            });
            fixedCount++;
          } catch (e) {
            console.error(`  Error updating progress for ${oldRecord.id}:`, e);
            if (String(e).includes("FOREIGN KEY")) {
              console.warn(
                `  [WARNING] FK Error updating progress. Deleting invalid record.`
              );
              await client.execute({
                sql: "DELETE FROM flashcard_progress WHERE id = ?",
                args: [oldRecord.id],
              });
              deletedCount++;
            }
          }
        }
      }
    }

    console.log(
      `User ${userId}: Deleted ${deletedCount} duplicates, Migrated ${fixedCount} old records.`
    );
  }

  console.log("Migration complete.");
}

main();

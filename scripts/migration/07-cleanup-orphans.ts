
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

async function cleanupOrphans() {
  console.log("🧹 Cleaning up orphaned records...\n");

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    // 1. Delete orphan flashcards (where word_id does not exist in vocabulary)
    console.log("Checking for orphan flashcards...");
    const fcOrphans = await db.execute(`
        SELECT count(*) as c FROM flashcards 
        WHERE word_id NOT IN (SELECT word_id FROM vocabulary)
    `);
    const fcCount = fcOrphans.rows[0].c as number;
    console.log(`   Found ${fcCount} orphan flashcards.`);

    if (fcCount > 0) {
        console.log("   Deleting orphan flashcards...");
        await db.execute(`
            DELETE FROM flashcards 
            WHERE word_id NOT IN (SELECT word_id FROM vocabulary)
        `);
        console.log("   ✅ Deleted orphan flashcards.");
    }

    // 2. Delete orphan progress (where word_id not in vocab OR flashcard_id not in flashcards)
    console.log("\nChecking for orphan progress records...");
    
    // Check by word_id
    const progWordOrphans = await db.execute(`
        SELECT count(*) as c FROM flashcard_progress 
        WHERE word_id NOT IN (SELECT word_id FROM vocabulary)
    `);
    console.log(`   Found ${progWordOrphans.rows[0].c} progress records with invalid word_id.`);

    // Check by flashcard_id
    const progFcOrphans = await db.execute(`
        SELECT count(*) as c FROM flashcard_progress 
        WHERE flashcard_id NOT IN (SELECT id FROM flashcards)
    `);
    console.log(`   Found ${progFcOrphans.rows[0].c} progress records with invalid flashcard_id.`);

    if ((progWordOrphans.rows[0].c as number) > 0 || (progFcOrphans.rows[0].c as number) > 0) {
        console.log("   Deleting orphan progress records...");
        
        // Delete where word_id invalid
        await db.execute(`
            DELETE FROM flashcard_progress 
            WHERE word_id NOT IN (SELECT word_id FROM vocabulary)
        `);
        
        // Delete where flashcard_id invalid
        await db.execute(`
            DELETE FROM flashcard_progress 
            WHERE flashcard_id NOT IN (SELECT id FROM flashcards)
        `);
        console.log("   ✅ Deleted orphan progress records.");
    }

    // 3. Verify FKs again
    console.log("\nRe-verifying Foreign Key Integrity...");
    try {
        const fkCheck = await db.execute("PRAGMA foreign_key_check");
        if (fkCheck.rows.length === 0) {
            console.log("   ✅ All foreign keys are valid");
        } else {
            console.error("   ❌ Foreign key violations found:");
            fkCheck.rows.slice(0, 10).forEach(row => console.error("      ", row));
        }
    } catch (e) {
        console.log("   ℹ️  Foreign key check failed");
    }

  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    db.close();
  }
}

cleanupOrphans();

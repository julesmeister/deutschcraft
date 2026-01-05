
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const MAPPING_FILE = path.join(
  process.cwd(),
  "scripts/migration/db-migration-mapping.json"
);

async function verifyMigration() {
  console.log("🔍 Verifying Migration Results...\n");

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    // 1. Load Mapping to check a sample
    const mappingContent = fs.readFileSync(MAPPING_FILE, "utf-8");
    const mappingData = JSON.parse(mappingContent);
    const mapping = new Map<string, string>(Object.entries(mappingData.mapping));
    
    console.log(`Loaded ${mapping.size} mappings.`);

    // Get a few samples
    const samples = Array.from(mapping.entries()).slice(0, 5);
    
    console.log("\nChecking sample mappings in DB:");
    for (const [oldId, newId] of samples) {
        // Check if oldId exists (should NOT)
        const oldCheck = await db.execute({
            sql: "SELECT word_id FROM vocabulary WHERE word_id = ?",
            args: [oldId]
        });
        
        // Check if newId exists (should)
        const newCheck = await db.execute({
            sql: "SELECT word_id FROM vocabulary WHERE word_id = ?",
            args: [newId]
        });

        const oldExists = oldCheck.rows.length > 0;
        const newExists = newCheck.rows.length > 0;

        console.log(`   Mapping ${oldId} -> ${newId}`);
        console.log(`      Old ID exists: ${oldExists ? '❌ YES' : '✅ NO'}`);
        console.log(`      New ID exists: ${newExists ? '✅ YES' : '❌ NO'}`);
    }

    // 2. Check counts
    console.log("\nChecking table counts:");
    const vocabCount = await db.execute("SELECT count(*) as c FROM vocabulary");
    const fcCount = await db.execute("SELECT count(*) as c FROM flashcards");
    const progCount = await db.execute("SELECT count(*) as c FROM flashcard_progress");

    console.log(`   Vocabulary: ${vocabCount.rows[0].c}`);
    console.log(`   Flashcards: ${fcCount.rows[0].c}`);
    console.log(`   Progress: ${progCount.rows[0].c}`);

    // 3. FK Check
    console.log("\nChecking Foreign Key Integrity:");
    try {
        const fkCheck = await db.execute("PRAGMA foreign_key_check");
        if (fkCheck.rows.length === 0) {
            console.log("   ✅ All foreign keys are valid");
        } else {
            console.error("   ❌ Foreign key violations found:");
            // Limit output
            fkCheck.rows.slice(0, 10).forEach(row => console.error("      ", row));
            if (fkCheck.rows.length > 10) console.error(`      ... and ${fkCheck.rows.length - 10} more`);
        }
    } catch (e) {
        console.log("   ℹ️  Foreign key check not supported or failed");
    }

  } catch (error) {
    console.error("❌ Verification failed:", error);
  } finally {
    db.close();
  }
}

verifyMigration();

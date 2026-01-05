/**
 * Step 5: Migrate Turso Database (Clone-and-Swap Strategy)
 * Updates flashcard IDs in Turso database using content-based mapping
 * Strategy: Insert New -> Relink -> Delete Old (to handle FK constraints)
 * Optimized: Uses batch execution
 */

import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const MAPPING_FILE = path.join(
  process.cwd(),
  "scripts/migration/db-migration-mapping.json"
);
const BACKUP_DIR = path.join(process.cwd(), "scripts/migration/backups");

const isDryRun = process.argv.includes("--dry-run");

interface MappingData {
  generatedAt: string;
  stats: {
    total: number;
    mapped: number;
    unmapped: number;
    alreadyCorrect: number;
  };
  mapping: Record<string, string>;
}

async function migrateTursoDatabase() {
  console.log(
    "🗄️  Migrating Turso Database (Clone-and-Swap) (Batched)" +
      (isDryRun ? " (DRY RUN)" : "") +
      "\n"
  );
  console.log("=".repeat(50));

  // Load mapping
  console.log("\n📖 Loading ID mapping...");
  const mappingContent = fs.readFileSync(MAPPING_FILE, "utf-8");
  const mappingData: MappingData = JSON.parse(mappingContent);
  const mapping = new Map(Object.entries(mappingData.mapping));

  console.log(`✅ Loaded ${mapping.size} ID mappings`);

  // Connect to Turso
  console.log("🔌 Connecting to Turso...");
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error(
      "❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set"
    );
    process.exit(1);
  }

  const db = createClient({
    url: dbUrl,
    authToken: authToken,
  });

  try {
    await db.execute("SELECT 1");
    console.log("✅ Connected to Turso database\n");

    // Create backup directory
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const timestamp = Date.now();

    // 1. Fetch all data
    console.log("📥 Fetching current data...");

    const vocabResult = await db.execute("SELECT * FROM vocabulary");
    console.log(`   - Vocabulary: ${vocabResult.rows.length} rows`);

    let flashcardsRows: any[] = [];
    let hasFlashcardsTable = false;
    try {
      const res = await db.execute("SELECT * FROM flashcards");
      flashcardsRows = res.rows;
      hasFlashcardsTable = true;
      console.log(`   - Flashcards: ${flashcardsRows.length} rows`);
    } catch (e) {
      console.log("   - Flashcards table not found (skipping)");
    }

    const progressResult = await db.execute("SELECT * FROM flashcard_progress");
    console.log(`   - Progress: ${progressResult.rows.length} rows`);

    // 2. Backup
    if (!isDryRun) {
      fs.writeFileSync(
        path.join(BACKUP_DIR, `vocabulary-backup-${timestamp}.json`),
        JSON.stringify(vocabResult.rows, null, 2)
      );
      if (hasFlashcardsTable) {
        fs.writeFileSync(
          path.join(BACKUP_DIR, `flashcards-backup-${timestamp}.json`),
          JSON.stringify(flashcardsRows, null, 2)
        );
      }
      fs.writeFileSync(
        path.join(BACKUP_DIR, `progress-backup-${timestamp}.json`),
        JSON.stringify(progressResult.rows, null, 2)
      );
      console.log("✅ Backups saved");
    }

    // 3. Process Migration
    console.log("\n🔄 Generating operations...");

    const allOperations: { sql: string; args: any[] }[] = [];
    let processedCount = 0;

    for (const vocabRow of vocabResult.rows) {
      const oldWordId = vocabRow.word_id as string;
      const newWordId = mapping.get(oldWordId);

      if (!newWordId || newWordId === oldWordId) {
        continue;
      }

      // A. Insert New Vocabulary
      const newVocabRow = { ...vocabRow, word_id: newWordId };
      allOperations.push(generateInsertSql("vocabulary", newVocabRow));

      // B. Handle Flashcards
      if (hasFlashcardsTable) {
        const relatedFlashcards = flashcardsRows.filter(
          (f) => f.word_id === oldWordId
        );
        for (const fcRow of relatedFlashcards) {
          const oldFcId = fcRow.id as string;
          const newFcId = mapping.get(oldFcId);

          if (newFcId) {
            const newFcRow = { ...fcRow, id: newFcId, word_id: newWordId };
            allOperations.push(generateInsertSql("flashcards", newFcRow));
          }
        }
      }

      // C. Update Progress
      const relatedProgress = progressResult.rows.filter(
        (p) => p.word_id === oldWordId
      );
      for (const pRow of relatedProgress) {
        const oldFcId = pRow.flashcard_id as string;
        const newFcId = mapping.get(oldFcId);

        if (newFcId) {
          const userId = pRow.user_id as string;
          const oldId = pRow.id as string;
          const newId = `${userId}_${newFcId}`;

          allOperations.push({
            sql: `UPDATE OR IGNORE flashcard_progress SET id = ?, flashcard_id = ?, word_id = ? WHERE id = ?`,
            args: [newId, newFcId, newWordId, oldId],
          });
        }
      }

      // D. Delete Old Vocabulary (Cascades to Old Flashcards)
      allOperations.push({
        sql: `DELETE FROM vocabulary WHERE word_id = ?`,
        args: [oldWordId],
      });

      processedCount++;
    }

    console.log(
      `   Prepared ${allOperations.length} SQL operations for ${processedCount} vocabulary items.`
    );

    if (isDryRun) {
      console.log("\n✅ Dry run complete.");
      return;
    }

    // 4. Execute in Batches
    console.log("\n🚀 Executing operations in batches...");

    const BATCH_SIZE = 50; // statements per batch
    let successCount = 0;
    let failureCount = 0;

    // Chunk operations
    for (let i = 0; i < allOperations.length; i += BATCH_SIZE) {
      const batch = allOperations.slice(i, i + BATCH_SIZE);
      try {
        await db.batch(batch, "write");
        successCount += batch.length;
        process.stdout.write(".");
        if (successCount % 1000 === 0)
          console.log(` (${successCount}/${allOperations.length})`);
      } catch (e) {
        console.error(
          `\n⚠️  Batch failed at index ${i}. Retrying sequentially...`
        );
        // Retry sequentially to find the culprit and proceed
        for (const op of batch) {
          try {
            await db.execute(op);
            successCount++;
          } catch (innerError: any) {
            console.error(`\n❌ Operation failed: ${innerError.message}`);
            console.error(`   SQL: ${op.sql}`);
            console.error(`   Args: ${JSON.stringify(op.args)}`);
            failureCount++;
          }
        }
      }
    }

    console.log(`\n\n✅ Execution finished.`);
    console.log(`   - Successful operations: ${successCount}`);
    console.log(`   - Failed operations: ${failureCount}`);

    if (failureCount === 0) {
      console.log("✅ Migration verified.");
    } else {
      console.warn("⚠️  Migration completed with errors. Check logs.");
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    db.close();
  }
}

function generateInsertSql(
  table: string,
  row: any
): { sql: string; args: any[] } {
  const keys = Object.keys(row);
  const columns = keys.join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT OR IGNORE INTO ${table} (${columns}) VALUES (${placeholders})`;
  const args = keys.map((k) => row[k]);
  return { sql, args };
}

migrateTursoDatabase();

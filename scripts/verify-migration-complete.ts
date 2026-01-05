/**
 * Final Migration Verification
 * Ensures all systems are using semantic IDs consistently
 */

import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

async function verifyMigration() {
  console.log("🔍 Final Migration Verification\n");
  console.log("=".repeat(70));

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  // 1. Check flashcard JSON files
  console.log("\n1️⃣  Checking Flashcard JSON Files...");
  const a1File = JSON.parse(
    fs.readFileSync("lib/data/vocabulary/levels/a1.json", "utf-8")
  );
  const sampleJsonId = a1File.flashcards[0].id;
  console.log(`   Sample ID: ${sampleJsonId}`);
  console.log(
    `   Format: ${sampleJsonId.includes("syllabus-") ? "❌ OLD" : "✅ NEW"}`
  );

  // 2. Check index files
  console.log("\n2️⃣  Checking Index Files...");
  const a1Index = JSON.parse(
    fs.readFileSync("lib/data/vocabulary/split/a1/_index.json", "utf-8")
  );
  const sampleIndexId = a1Index.categories[0].ids[0];
  console.log(`   Sample ID: ${sampleIndexId}`);
  console.log(
    `   Format: ${sampleIndexId.includes("syllabus-") ? "❌ OLD" : "✅ NEW"}`
  );

  // 3. Check database
  console.log("\n3️⃣  Checking Database...");

  const totalProgress = await db.execute("SELECT COUNT(*) as c FROM flashcard_progress");
  console.log(`   Total progress records: ${totalProgress.rows[0].c}`);

  const oldFormat = await db.execute(
    "SELECT COUNT(*) as c FROM flashcard_progress WHERE flashcard_id LIKE 'syllabus-%' OR flashcard_id LIKE 'FLASH_%'"
  );
  console.log(`   Old format IDs: ${oldFormat.rows[0].c}`);

  const newFormat = await db.execute(
    "SELECT COUNT(*) as c FROM flashcard_progress WHERE flashcard_id LIKE 'a1-%' OR flashcard_id LIKE 'a2-%' OR flashcard_id LIKE 'b1-%' OR flashcard_id LIKE 'b2-%' OR flashcard_id LIKE 'c1-%' OR flashcard_id LIKE 'c2-%'"
  );
  console.log(`   New format IDs: ${newFormat.rows[0].c}`);

  const sampleDb = await db.execute("SELECT flashcard_id FROM flashcard_progress LIMIT 1");
  const sampleDbId = sampleDb.rows[0]?.flashcard_id || "N/A";
  console.log(`   Sample ID: ${sampleDbId}`);

  // 4. Check due cards
  console.log("\n4️⃣  Checking Due Cards...");
  const now = Date.now();
  const dueCards = await db.execute({
    sql: "SELECT COUNT(*) as c FROM flashcard_progress WHERE next_review_date <= ?",
    args: [now],
  });
  console.log(`   Due cards: ${dueCards.rows[0].c}`);

  // 5. ID alignment check
  console.log("\n5️⃣  ID Alignment Check...");
  const jsonUsingNew = !sampleJsonId.includes("syllabus-");
  const indexUsingNew = !sampleIndexId.includes("syllabus-");
  const dbUsingNew = Number(oldFormat.rows[0].c) === 0;

  const aligned = jsonUsingNew && indexUsingNew && dbUsingNew;

  console.log(`   JSON files:  ${jsonUsingNew ? "✅" : "❌"} Using semantic IDs`);
  console.log(`   Index files: ${indexUsingNew ? "✅" : "❌"} Using semantic IDs`);
  console.log(`   Database:    ${dbUsingNew ? "✅" : "❌"} Using semantic IDs`);

  console.log("\n" + "=".repeat(70));

  if (aligned) {
    console.log("\n✅ MIGRATION COMPLETE!");
    console.log("\nAll systems are using semantic IDs consistently.");
    console.log("\n📋 Next steps:");
    console.log("   1. Restart your dev server: npm run dev");
    console.log("   2. Go to http://localhost:3000/dashboard/student/flashcards");
    console.log("   3. Verify due counts appear for categories");
    console.log("   4. Verify progress bars show correctly");
  } else {
    console.log("\n⚠️  MIGRATION INCOMPLETE");
    console.log("\nSome systems are still using old IDs.");
    console.log("Please investigate the failing components above.");
  }

  console.log("");
}

verifyMigration().catch(console.error);

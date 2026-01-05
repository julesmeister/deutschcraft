import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

async function checkDueCards() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const now = Date.now();
  console.log(`Current timestamp: ${now} (${new Date(now).toISOString()})\n`);

  // Count total cards
  const total = await db.execute("SELECT COUNT(*) as count FROM flashcard_progress");
  console.log(`Total flashcard progress records: ${total.rows[0].count}`);

  // Count due cards
  const due = await db.execute({
    sql: "SELECT COUNT(*) as count FROM flashcard_progress WHERE next_review_date <= ?",
    args: [now],
  });
  console.log(`Due cards (next_review_date <= now): ${due.rows[0].count}`);

  // Check next_review_date distribution
  console.log("\nNext Review Date Analysis:");

  // Cards with null next_review_date
  const nullDate = await db.execute(
    "SELECT COUNT(*) as count FROM flashcard_progress WHERE next_review_date IS NULL"
  );
  console.log(`  NULL next_review_date: ${nullDate.rows[0].count}`);

  // Cards due in the past
  const pastDue = await db.execute({
    sql: "SELECT COUNT(*) as count FROM flashcard_progress WHERE next_review_date < ?",
    args: [now],
  });
  console.log(`  Past due (< now): ${pastDue.rows[0].count}`);

  // Cards due in the future
  const future = await db.execute({
    sql: "SELECT COUNT(*) as count FROM flashcard_progress WHERE next_review_date > ?",
    args: [now],
  });
  console.log(`  Future (> now): ${future.rows[0].count}`);

  // Sample due cards
  console.log("\nSample DUE cards:");
  const dueSamples = await db.execute({
    sql: "SELECT flashcard_id, word_id, next_review_date, state, repetitions FROM flashcard_progress WHERE next_review_date <= ? LIMIT 10",
    args: [now],
  });
  dueSamples.rows.forEach((row, i) => {
    const reviewDate = new Date(Number(row.next_review_date));
    console.log(`  ${i + 1}. ${row.flashcard_id}`);
    console.log(`     next_review_date: ${reviewDate.toISOString()}`);
    console.log(`     state: ${row.state}, repetitions: ${row.repetitions}`);
  });

  // Sample NOT due cards
  console.log("\nSample NOT DUE cards:");
  const notDueSamples = await db.execute({
    sql: "SELECT flashcard_id, word_id, next_review_date, state, repetitions FROM flashcard_progress WHERE next_review_date > ? LIMIT 5",
    args: [now],
  });
  notDueSamples.rows.forEach((row, i) => {
    const reviewDate = new Date(Number(row.next_review_date));
    console.log(`  ${i + 1}. ${row.flashcard_id}`);
    console.log(`     next_review_date: ${reviewDate.toISOString()}`);
    console.log(`     state: ${row.state}, repetitions: ${row.repetitions}`);
  });
}

checkDueCards().catch(console.error);

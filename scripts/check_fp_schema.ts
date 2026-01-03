
import { db } from '../turso/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkSchema() {
  console.log("Checking flashcard_progress schema...");
  try {
    const result = await db.execute("PRAGMA table_info(flashcard_progress)");
    console.table(result.rows);
  } catch (error) {
    console.error("Error:", error);
  }
}

checkSchema();

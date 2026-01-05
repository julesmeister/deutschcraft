
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function checkSchema() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });

  const tables = ['vocabulary', 'flashcards', 'flashcard_progress'];
  for (const table of tables) {
    const res = await db.execute(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`);
    if (res.rows.length > 0) {
      console.log(`\n--- Schema for ${table} ---`);
      console.log(res.rows[0].sql);
    } else {
        console.log(`\n--- ${table} does not exist ---`);
    }
  }
}

checkSchema().catch(console.error);


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

  console.log('Schema for vocabulary:');
  const vocab = await db.execute('PRAGMA table_info(vocabulary)');
  console.table(vocab.rows);

  console.log('\nChecking for syllabus- IDs:');
  const syllabus = await db.execute("SELECT word_id FROM vocabulary WHERE word_id LIKE 'syllabus-%' LIMIT 5");
  if (syllabus.rows.length > 0) {
    console.log('Found syllabus IDs:', syllabus.rows);
  } else {
    console.log('No syllabus IDs found in vocabulary.');
  }
}

checkSchema().catch(console.error);

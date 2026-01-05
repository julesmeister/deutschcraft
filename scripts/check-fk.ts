
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function checkFk() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });

  await db.execute('PRAGMA foreign_keys = OFF');
  const res = await db.execute('PRAGMA foreign_keys');
  console.log('FK state:', res.rows);
}

checkFk().catch(console.error);

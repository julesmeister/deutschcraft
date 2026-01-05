
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config();

async function checkMulti() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
  });

  try {
    await db.execute('PRAGMA foreign_keys = OFF; SELECT 1;');
    console.log('✅ Multi-statement execute worked');
  } catch (e) {
    console.log('❌ Multi-statement execute failed:', e);
  }
}

checkMulti().catch(console.error);

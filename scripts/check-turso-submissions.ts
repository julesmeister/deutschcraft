import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local
config({ path: join(process.cwd(), '.env.local') });

import { db } from '../turso/client';

async function checkSubmissions() {
  try {
    console.log('Checking writing submissions in Turso...');
    console.log('DB URL:', process.env.TURSO_DATABASE_URL?.substring(0, 30) + '...');

    const result = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM writing_submissions',
      args: [],
    });

    console.log('Total submissions:', result.rows[0]?.count);

    // Check a few recent ones
    const recent = await db.execute({
      sql: 'SELECT user_id, exercise_type, submitted_at FROM writing_submissions ORDER BY submitted_at DESC LIMIT 5',
      args: [],
    });

    console.log('\nRecent submissions:', recent.rows);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkSubmissions();

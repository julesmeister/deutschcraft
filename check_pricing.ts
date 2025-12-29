import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './turso/client';

async function check() {
  try {
    console.log('Checking config table...');
    const result = await db.execute({
      sql: "SELECT value FROM config WHERE key = 'course-pricing'",
      args: []
    });
    
    if (result.rows.length > 0) {
      console.log('Found config!');
      const data = JSON.parse(result.rows[0].value as string);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('Config not found');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

check();

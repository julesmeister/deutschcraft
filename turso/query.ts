import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const db = createClient({
  url,
  authToken,
});

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error('Please provide a SQL query as an argument');
    process.exit(1);
  }

  try {
    console.log(`Executing: ${query}`);
    const result = await db.execute(query);
    console.table(result.rows);
  } catch (error) {
    console.error('Error executing query:', error);
    process.exit(1);
  }
}

main();

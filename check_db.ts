process.env.TURSO_DATABASE_URL = "libsql://deutschcraft-orbitandchill.aws-ap-northeast-1.turso.io";
process.env.TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjY5MTIwNjQsImlkIjoiOGYzZDNlMTQtNjBhNC00YTMwLTgzNjMtMjU3ZGE1OTRkMDUwIiwicmlkIjoiN2FkNTU5ZDQtNjhkMS00Nzg0LTg5YjctMGIwN2I1NzM5NTZiIn0.Kq6w9rAGRly0_vHfCv6fvEtJ-Ca8XJ4wRsr3g1ZRySQYUhlX7NhxWKuDPArXjL_gt9JEUpYO0dJuOMA9wU4YBg";

import { db } from './turso/client';

async function check() {
  try {
    console.log('Checking database...');
    
    // Check counts
    const count = await db.execute('SELECT COUNT(*) as total, COUNT(ai_corrected_version) as with_ai FROM writing_submissions');
    console.log('Counts:', count.rows[0]);

    // Check specific submissions
    const ids = ['LOA20wsXmJNNZtnBWRBx', 'dJba69RGE0AypKqhn3B6'];
    for (const id of ids) {
        const sub = await db.execute({
            sql: 'SELECT submission_id, ai_corrected_version FROM writing_submissions WHERE submission_id = ?',
            args: [id]
        });
        console.log(`Submission ${id}:`, sub.rows);
    }

  } catch (e) {
    console.error('Error:', e);
  }
}

check();

import { config } from 'dotenv';
import { db } from '../turso/client';

// Load .env.local
config({ path: '.env.local' });

async function checkTables() {
  try {
    console.log('Checking Turso database tables...\n');

    // Check progress table
    const progressCount = await db.execute('SELECT COUNT(*) as count FROM progress');
    console.log('Progress records:', progressCount.rows[0]?.count || 0);

    // Check flashcard_progress table
    const fpCount = await db.execute('SELECT COUNT(*) as count FROM flashcard_progress');
    console.log('Flashcard progress records:', fpCount.rows[0]?.count || 0);

    // Check writing_progress table
    const wpCount = await db.execute('SELECT COUNT(*) as count FROM writing_progress');
    console.log('Writing progress records:', wpCount.rows[0]?.count || 0);

    // Check writing_stats table
    const wsCount = await db.execute('SELECT COUNT(*) as count FROM writing_stats');
    console.log('Writing stats records:', wsCount.rows[0]?.count || 0);

    // Check writing_submissions table
    const submissionsCount = await db.execute('SELECT COUNT(*) as count FROM writing_submissions');
    console.log('Writing submissions records:', submissionsCount.rows[0]?.count || 0);

    console.log('\nDone!');
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();

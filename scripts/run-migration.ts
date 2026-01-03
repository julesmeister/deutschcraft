/**
 * Script to trigger database migration from Firestore to Turso
 * Migrates progress data (flashcards, writing, submissions)
 */

async function runMigration() {
  try {
    console.log('Starting progress data migration from Firestore to Turso...\n');

    const response = await fetch('http://localhost:3000/api/database/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scope: 'progress' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Migration failed with status ${response.status}`);
    }

    const result = await response.json();

    console.log('✅ Migration completed successfully!\n');
    console.log('Migration Stats:');
    console.log('- Progress records:', result.stats?.progress || 0);
    console.log('- Flashcard progress:', result.stats?.flashcardProgress || 0);
    console.log('- Writing progress:', result.stats?.writingProgress || 0);
    console.log('- Writing stats:', result.stats?.writingStats || 0);
    console.log('- Writing submissions:', result.stats?.writingSubmissions || 0);
    console.log('\nTotal records migrated:', result.stats?.total || 0);

    if (result.logs && result.logs.length > 0) {
      console.log('\nMigration logs:');
      result.logs.forEach((log: string) => console.log(log));
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

runMigration();

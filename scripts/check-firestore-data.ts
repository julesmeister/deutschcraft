/**
 * Check if data exists in Firestore collections
 */

import { config } from 'dotenv';
import { adminDb } from '../lib/firebaseAdmin';

// Load environment variables
config({ path: '.env.local' });

async function checkFirestoreData() {
  try {
    console.log('Checking Firestore collections...\n');

    // Check progress collection
    const progressSnapshot = await adminDb.collection('progress').get();
    console.log('Progress records:', progressSnapshot.size);

    // Check flashcard-progress collection
    const fpSnapshot = await adminDb.collection('flashcard-progress').get();
    console.log('Flashcard progress records:', fpSnapshot.size);

    // Check writing_progress collection
    const wpSnapshot = await adminDb.collection('writing_progress').get();
    console.log('Writing progress records:', wpSnapshot.size);

    // Check writing_stats collection
    const wsSnapshot = await adminDb.collection('writing_stats').get();
    console.log('Writing stats records:', wsSnapshot.size);

    // Check writing-submissions collection
    const submissionsSnapshot = await adminDb.collection('writing-submissions').get();
    console.log('Writing submissions records:', submissionsSnapshot.size);

    // Legacy collections
    const legacySubmissions = await adminDb.collection('writingSubmissions').get();
    console.log('Legacy writing submissions records:', legacySubmissions.size);

    console.log('\nTotal records to migrate:',
      progressSnapshot.size +
      fpSnapshot.size +
      wpSnapshot.size +
      wsSnapshot.size +
      submissionsSnapshot.size +
      legacySubmissions.size
    );

    console.log('\n✅ Data check complete!');
  } catch (error) {
    console.error('Error checking Firestore:', error);
  }
}

checkFirestoreData();

/**
 * Check what collections exist in Firebase and how many documents each has
 */

import { adminDb } from '../lib/firebaseAdmin';

async function checkCollections() {
  console.log('🔍 Checking Firebase collections...\n');

  const collections = [
    'users',
    'batches',
    'tasks',
    'submissions',
    'progress',
    'vocabulary',
    'flashcards',
    'flashcard-progress',
    'exercise-overrides',
    'saved-vocabulary',
    'activities',
    'grammar-rules',
    'grammar-sentences',
    'grammar-reviews',
  ];

  for (const collectionName of collections) {
    try {
      const snapshot = await adminDb.collection(collectionName).get();
      const count = snapshot.docs.length;

      if (count > 0) {
        console.log(`✅ ${collectionName}: ${count} documents`);
        // Show first document structure
        const firstDoc = snapshot.docs[0];
        console.log(`   Sample ID: ${firstDoc.id}`);
        console.log(`   Fields: ${Object.keys(firstDoc.data()).join(', ')}\n`);
      } else {
        console.log(`❌ ${collectionName}: EMPTY\n`);
      }
    } catch (error) {
      console.log(`⚠️  ${collectionName}: ERROR - ${error}\n`);
    }
  }
}

checkCollections()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

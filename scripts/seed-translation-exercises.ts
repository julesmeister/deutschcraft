/**
 * Seed script to add translation exercises to Firestore
 * Run this script to populate your database with translation exercises
 *
 * Usage:
 * 1. Make sure your Firebase config is set up in .env.local
 * 2. Run: npm run seed:translations
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { TRANSLATION_EXERCISES } from '../lib/data/translationExercises';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedTranslationExercises() {
  console.log('🌱 Starting translation exercises seed...');
  console.log(`📝 Found ${TRANSLATION_EXERCISES.length} translation exercises to seed`);

  let successCount = 0;
  let errorCount = 0;

  for (const exercise of TRANSLATION_EXERCISES) {
    try {
      const exerciseRef = doc(db, 'translation-exercises', exercise.exerciseId);
      await setDoc(exerciseRef, {
        ...exercise,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      console.log(`✅ Seeded: ${exercise.exerciseId} - ${exercise.title} (${exercise.level})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error seeding ${exercise.exerciseId}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total: ${TRANSLATION_EXERCISES.length}`);
  console.log('\n✨ Translation exercises seeding complete!');
  process.exit(0);
}

// Run the seed function
seedTranslationExercises().catch((error) => {
  console.error('💥 Fatal error during seeding:', error);
  process.exit(1);
});

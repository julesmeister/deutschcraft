/**
 * Fix existing student document to match expected schema
 * Updates your existing "orbitandchill@gmail.com" student
 *
 * Usage: npx tsx scripts/fix-existing-student.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixStudent() {
  console.log('🔧 Fixing existing student document...\n');

  try {
    const userRef = doc(db, 'users', 'orbitandchill@gmail.com');

    await updateDoc(userRef, {
      userId: 'orbitandchill@gmail.com',
      firstName: 'Orbit',
      lastName: 'Chill',
      role: 'STUDENT', // Uppercase to match schema
      teacherId: null,  // Ensure it's null for "Add Students" dialog
      batchId: null,
      updatedAt: Date.now(),
    });

    console.log('✅ Successfully updated student:');
    console.log('   - Email: orbitandchill@gmail.com');
    console.log('   - Name: Orbit Chill');
    console.log('   - Role: STUDENT (uppercase)');
    console.log('   - teacherId: null');
    console.log('   - batchId: null');
    console.log('\n✨ Student should now appear in "Add Students" dialog!');

  } catch (error) {
    console.error('❌ Error fixing student:', error);
  }
}

fixStudent().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed:', error);
  process.exit(1);
});

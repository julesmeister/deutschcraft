/**
 * Create teacher user document in Firestore
 * For user: zoom.flux@gmail.com (Jules Lee)
 *
 * Usage: npx tsx scripts/create-teacher.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { CEFRLevel } from '../lib/models';

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

async function createTeacher() {
  console.log('👨‍🏫 Creating teacher account...\n');

  const teacherEmail = 'zoom.flux@gmail.com';

  try {
    const userRef = doc(db, 'users', teacherEmail);

    await setDoc(userRef, {
      userId: teacherEmail,
      email: teacherEmail,
      firstName: 'Jules',
      lastName: 'Lee',
      role: 'TEACHER', // Uppercase to match schema

      // Teacher-specific fields
      totalStudents: 0,
      activeBatches: 0,

      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log('✅ Successfully created teacher account:');
    console.log('   - Email:', teacherEmail);
    console.log('   - Name: Jules Lee');
    console.log('   - Role: TEACHER');
    console.log('\n✨ You can now access teacher features!');
    console.log('   - Create batches');
    console.log('   - Add students to batches');
    console.log('   - Create and manage writing tasks');

  } catch (error) {
    console.error('❌ Error creating teacher:', error);
  }
}

createTeacher().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Failed:', error);
  process.exit(1);
});

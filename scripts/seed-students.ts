/**
 * Seed script to add test students to Firestore
 * Run this script to populate your database with sample students
 *
 * Usage:
 * 1. Make sure your Firebase config is set up in .env.local
 * 2. Run: npx tsx scripts/seed-students.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { CEFRLevel } from '../lib/models';

// Firebase configuration (update with your config)
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

// Sample students data
const sampleStudents = [
  {
    email: 'anna.mueller@example.com',
    firstName: 'Anna',
    lastName: 'Müller',
    role: 'STUDENT' as const,
    cefrLevel: CEFRLevel.A2,
    teacherId: null,
    batchId: null,
    wordsLearned: 150,
    wordsMastered: 80,
    currentStreak: 5,
    dailyGoal: 25,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    email: 'max.schmidt@example.com',
    firstName: 'Max',
    lastName: 'Schmidt',
    role: 'STUDENT' as const,
    cefrLevel: CEFRLevel.A1,
    teacherId: null,
    batchId: null,
    wordsLearned: 75,
    wordsMastered: 40,
    currentStreak: 3,
    dailyGoal: 20,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    email: 'lisa.weber@example.com',
    firstName: 'Lisa',
    lastName: 'Weber',
    role: 'STUDENT' as const,
    cefrLevel: CEFRLevel.B1,
    teacherId: null,
    batchId: null,
    wordsLearned: 300,
    wordsMastered: 200,
    currentStreak: 10,
    dailyGoal: 30,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    email: 'tom.wagner@example.com',
    firstName: 'Tom',
    lastName: 'Wagner',
    role: 'STUDENT' as const,
    cefrLevel: CEFRLevel.A2,
    teacherId: null,
    batchId: null,
    wordsLearned: 120,
    wordsMastered: 60,
    currentStreak: 2,
    dailyGoal: 25,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    email: 'sarah.becker@example.com',
    firstName: 'Sarah',
    lastName: 'Becker',
    role: 'STUDENT' as const,
    cefrLevel: CEFRLevel.B2,
    teacherId: null,
    batchId: null,
    wordsLearned: 500,
    wordsMastered: 350,
    currentStreak: 15,
    dailyGoal: 35,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

async function seedStudents() {
  console.log('🌱 Starting to seed students...\n');

  try {
    for (const student of sampleStudents) {
      const userRef = doc(db, 'users', student.email);
      await setDoc(userRef, {
        userId: student.email,
        ...student,
      });
      console.log(`✅ Created student: ${student.firstName} ${student.lastName} (${student.email})`);
    }

    console.log('\n🎉 Successfully seeded', sampleStudents.length, 'students!');
    console.log('\n📝 Students have been created with:');
    console.log('   - role: STUDENT');
    console.log('   - teacherId: null (unassigned)');
    console.log('   - batchId: null (not in any batch)');
    console.log('\nYou can now assign them to batches in the teacher dashboard.');

  } catch (error) {
    console.error('❌ Error seeding students:', error);
  }
}

// Run the seed function
seedStudents().then(() => {
  console.log('\n✨ Seed complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});

/**
 * Debug Script: Check all students in Firestore
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function checkStudents() {
  console.log('📊 Checking all students in Firestore...\n');

  const usersSnapshot = await db.collection('users').get();

  const students = usersSnapshot.docs
    .map(doc => ({ userId: doc.id, ...doc.data() }))
    .filter(user => user.role === 'STUDENT');

  console.log(`Found ${students.length} students:\n`);

  students.forEach(student => {
    console.log('─'.repeat(60));
    console.log(`📧 Email: ${student.email}`);
    console.log(`👤 Name: ${student.name || `${student.firstName} ${student.lastName}`}`);
    console.log(`👨‍🏫 Teacher ID: ${student.teacherId || 'NONE'}`);
    console.log(`📚 Batch ID: "${student.batchId}" ${student.batchId ? `(length: ${student.batchId.length})` : ''}`);
    console.log(`🎓 CEFR Level: ${student.cefrLevel || 'NONE'}`);
    console.log(`📝 Role: ${student.role}`);
  });

  console.log('─'.repeat(60));
}

checkStudents()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });

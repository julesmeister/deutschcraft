import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';
import { CEFRLevel } from '@/lib/models';

/**
 * POST /api/student/initialize
 * Creates a new student record for a user who just signed up
 * This is called after authentication when no student record exists
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email, name } = session.user;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if student already exists
    const existingStudents = await adminDb
      .collection('students')
      .where('userId', '==', email)
      .limit(1)
      .get();

    if (!existingStudents.empty) {
      // Student already exists, return it
      const doc = existingStudents.docs[0];
      return NextResponse.json({
        studentId: doc.id,
        ...doc.data(),
      });
    }

    // Create new student record with default values
    const now = Date.now();
    const newStudent = {
      userId: email,
      targetLanguage: 'German',
      currentLevel: CEFRLevel.A1, // Start at beginner level

      // Learning Statistics (all start at 0)
      wordsLearned: 0,
      wordsMastered: 0,
      sentencesCreated: 0,
      sentencesPerfect: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPracticeTime: 0,
      lastActiveDate: now,

      // Settings (default values)
      dailyGoal: 20, // 20 words per day default
      notificationsEnabled: true,
      soundEnabled: true,

      createdAt: now,
      updatedAt: now,
    };

    // Add to Firestore
    const docRef = await adminDb.collection('students').add(newStudent);

    // Also create/update user record
    await adminDb.collection('users').doc(email).set({
      email,
      name: name || 'Student',
      role: 'student',
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    return NextResponse.json({
      studentId: docRef.id,
      ...newStudent,
    });
  } catch (error) {
    console.error('Error initializing student:', error);
    return NextResponse.json(
      { error: 'Failed to initialize student' },
      { status: 500 }
    );
  }
}

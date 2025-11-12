import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { initializeStudent } from '@/lib/services/studentService.admin';

/**
 * POST /api/student/initialize
 * Creates a new student record for a user who just signed up
 * This is called after authentication when no student record exists
 * Uses studentService.admin for database abstraction
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

    // Initialize student using service layer
    const student = await initializeStudent(email, name || undefined);

    return NextResponse.json(student);
  } catch (error) {
    console.error('[API /student/initialize] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize student' },
      { status: 500 }
    );
  }
}

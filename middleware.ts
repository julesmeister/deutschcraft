import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (!token?.email) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Get user data from JWT token
    const userRole = token.role as string | undefined;
    const enrollmentStatus = token.enrollmentStatus as string | undefined;

    // Check if user is pending approval
    const isPending = !userRole || userRole === 'PENDING_APPROVAL' || enrollmentStatus === 'pending';

    // Allow public access to syllabus page
    if (pathname.startsWith('/dashboard/student/syllabus')) {
      return NextResponse.next();
    }

    // Redirect logic based on path and user role
    if (pathname.startsWith('/dashboard/student')) {
      // Student dashboard - only for approved students
      if (isPending || userRole !== 'STUDENT') {
        return NextResponse.redirect(new URL('/dashboard/settings', req.url));
      }
    } else if (pathname.startsWith('/dashboard/teacher')) {
      // Teacher dashboard - only for teachers
      if (isPending || userRole !== 'TEACHER') {
        return NextResponse.redirect(new URL('/dashboard/settings', req.url));
      }
    } else if (pathname === '/dashboard') {
      // Main dashboard - redirect based on role
      if (isPending) {
        return NextResponse.redirect(new URL('/dashboard/settings', req.url));
      } else if (userRole === 'TEACHER') {
        return NextResponse.redirect(new URL('/dashboard/teacher', req.url));
      } else if (userRole === 'STUDENT') {
        return NextResponse.redirect(new URL('/dashboard/student', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // User must be logged in
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};

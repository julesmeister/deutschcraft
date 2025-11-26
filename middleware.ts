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
    const userRole = (token.role as string | undefined)?.toUpperCase(); // Normalize to uppercase
    const enrollmentStatus = token.enrollmentStatus as string | undefined;

    console.log('[Middleware]', pathname, '| Role:', userRole, '| Status:', enrollmentStatus);

    // Check if user is pending approval
    const isPending = !userRole || userRole === 'PENDING_APPROVAL' || enrollmentStatus === 'pending';

    // Allow public access to syllabus page
    if (pathname.startsWith('/dashboard/student/syllabus')) {
      return NextResponse.next();
    }

    // Redirect logic based on path and user role
    if (pathname.startsWith('/dashboard/student')) {
      // Student dashboard - accessible by approved students OR teachers (admin access)
      if (isPending || (userRole !== 'STUDENT' && userRole !== 'TEACHER')) {
        return NextResponse.redirect(new URL('/dashboard/settings', req.url));
      }
    } else if (pathname.startsWith('/dashboard/teacher')) {
      // Allow students to view their own detail page
      const isOwnDetailPage = pathname.startsWith('/dashboard/teacher/students/') &&
                              pathname.includes(encodeURIComponent(token.email));

      // Teacher dashboard - only for teachers (except students viewing their own detail page)
      if (isPending || (userRole !== 'TEACHER' && !isOwnDetailPage)) {
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

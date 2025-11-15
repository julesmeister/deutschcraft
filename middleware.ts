import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public access to syllabus page
        if (req.nextUrl.pathname.startsWith('/dashboard/student/syllabus')) {
          return true;
        }

        // Require authentication for all other dashboard routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: '/dashboard/:path*',
};

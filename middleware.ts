import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    console.info('🔐 [Middleware] Request to:', req.nextUrl.pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const isAuthorized = !!token;
        console.info('🔐 [Middleware] Checking auth for:', req.nextUrl.pathname);
        console.info('🔐 [Middleware] Has token:', isAuthorized);
        console.info('🔐 [Middleware] Token email:', token?.email);

        // Allow public access to syllabus page
        if (req.nextUrl.pathname.startsWith('/dashboard/student/syllabus')) {
          console.info('✅ [Middleware] Allowing public access to syllabus');
          return true;
        }

        // Require authentication for all other dashboard routes
        if (!isAuthorized) {
          console.error('❌ [Middleware] NOT AUTHORIZED - No token found!');
        } else {
          console.info('✅ [Middleware] AUTHORIZED - Token exists');
        }

        return isAuthorized;
      },
    },
  }
);

export const config = {
  matcher: '/dashboard/:path*',
};

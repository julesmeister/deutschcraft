'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { isPendingApproval } from '@/lib/models/user';
import { CatLoader } from '@/components/ui/CatLoader';

interface EnrollmentGuardProps {
  children: React.ReactNode;
}

// Routes that pending users CAN access
const ALLOWED_ROUTES_FOR_PENDING = [
  '/dashboard/settings',
  '/dashboard', // Main redirect page
];

export function EnrollmentGuard({ children }: EnrollmentGuardProps) {
  const { data: session, status } = useSession();
  const { student: currentUser, isLoading } = useCurrentStudent(session?.user?.email || null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while loading
    if (status === 'loading' || isLoading) {
      return;
    }

    // Not authenticated - let middleware handle
    if (!session) {
      return;
    }

    // Check if user is pending approval or doesn't have a document
    const isPending = !currentUser || (currentUser && isPendingApproval(currentUser));

    // If user is pending and trying to access a restricted route
    if (isPending) {
      const isAllowedRoute = ALLOWED_ROUTES_FOR_PENDING.some(route =>
        pathname === route || pathname.startsWith(route)
      );

      if (!isAllowedRoute) {
        // Prevent redirect loop - only redirect if not already redirecting
        if (pathname !== '/dashboard/settings') {
          router.push('/dashboard/settings');
        }
      }
    }
  }, [session, status, currentUser, isLoading, pathname, router]);

  // Show loading while checking enrollment status
  if (status === 'loading' || isLoading) {
    return <CatLoader fullScreen message="Loading..." />;
  }

  // Render children if checks pass
  return <>{children}</>;
}

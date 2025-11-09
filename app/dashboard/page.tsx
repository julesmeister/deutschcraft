'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCurrentUser } from '@/lib/hooks/useUsers';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, isLoading: isLoadingUser } = useCurrentUser(session?.user?.email || null);

  useEffect(() => {
    if (status === 'loading' || isLoadingUser) return;

    if (!session) {
      // Redirect to home if not authenticated
      router.push('/');
      return;
    }

    // Redirect based on user role from Firestore
    if (user?.role === 'TEACHER') {
      router.push('/dashboard/teacher');
    } else {
      // Default to student dashboard (includes 'STUDENT' role and fallback)
      router.push('/dashboard/student');
    }
  }, [session, status, router, user, isLoadingUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-piku-purple-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

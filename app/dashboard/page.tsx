'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCurrentUser } from '@/lib/hooks/useUsers';
import { CatLoader } from '@/components/ui/CatLoader';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, isLoading: isLoadingUser } = useCurrentUser(session?.user?.email || null);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (isLoadingUser) {
      return;
    }

    if (!session) {
      router.push('/');
      return;
    }

    // Redirect based on user role from Firestore
    if (user?.role === 'TEACHER') {
      router.push('/dashboard/teacher');
    } else {
      router.push('/dashboard/student');
    }
  }, [session, status, router, user, isLoadingUser]);

  return <CatLoader fullScreen message="Loading dashboard..." />;
}

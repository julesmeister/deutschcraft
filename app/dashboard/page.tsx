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

  console.info('📊 Dashboard page rendered | Status:', status, '| User loading:', isLoadingUser, '| User role:', user?.role);

  useEffect(() => {
    console.info('📊 Dashboard useEffect triggered');
    console.info('Status:', status, '| Loading user:', isLoadingUser, '| Session:', !!session, '| User:', user?.email);

    if (status === 'loading') {
      console.info('⏳ Waiting for session...');
      return;
    }

    if (isLoadingUser) {
      console.info('⏳ Waiting for user data from Firestore...');
      return;
    }

    if (!session) {
      console.info('❌ No session, redirecting to home');
      router.push('/');
      return;
    }

    // Redirect based on user role from Firestore
    if (user?.role === 'TEACHER') {
      console.info('👨‍🏫 Teacher detected, redirecting to /dashboard/teacher');
      router.push('/dashboard/teacher');
    } else {
      console.info('👨‍🎓 Student detected (or default), redirecting to /dashboard/student');
      router.push('/dashboard/student');
    }
  }, [session, status, router, user, isLoadingUser]);

  return <CatLoader fullScreen message="Loading dashboard..." />;
}

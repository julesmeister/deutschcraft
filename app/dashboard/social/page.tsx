'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useUsers';
import { CatLoader } from '@/components/ui/CatLoader';

export default function SocialRedirectPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { user, isLoading } = useCurrentUser(session?.user?.email || null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // If no user, redirect to settings
      router.push('/dashboard/settings');
      return;
    }

    // Redirect based on user role
    if (user.role === 'TEACHER') {
      router.push('/dashboard/teacher/social');
    } else if (user.role === 'STUDENT') {
      router.push('/dashboard/student/social');
    } else {
      // Default to student for pending approval users
      router.push('/dashboard/student/social');
    }
  }, [user, isLoading, router]);

  return <CatLoader message="Loading social feed..." size="lg" fullScreen />;
}

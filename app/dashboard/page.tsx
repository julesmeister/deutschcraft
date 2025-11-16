'use client';

import { CatLoader } from '@/components/ui/CatLoader';

export default function DashboardPage() {
  // Middleware handles all redirects based on user role
  // This page just shows a loading state while middleware processes
  return <CatLoader fullScreen message="Loading dashboard..." />;
}

'use client';

import { FirebaseAuthProvider } from '@/lib/contexts/FirebaseAuthContext';
import { PlaygroundSessionProvider } from '@/lib/contexts/PlaygroundSessionContext';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';
import { MinimizedPlayground } from '@/components/playground/MinimizedPlayground';
import { EnrollmentGuard } from '@/components/dashboard/EnrollmentGuard';

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseAuthProvider>
      <PlaygroundSessionProvider>
        <div className="min-h-screen bg-gray-50">
          <DashboardNavbar />

          <main>
            <EnrollmentGuard>
              {children}
            </EnrollmentGuard>
          </main>

          <MinimizedPlayground />
        </div>
      </PlaygroundSessionProvider>
    </FirebaseAuthProvider>
  );
}

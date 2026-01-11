'use client';

import { EnrollmentGuard } from '@/components/dashboard/EnrollmentGuard';
import { PlaygroundSessionProvider } from '@/lib/contexts/PlaygroundSessionContext';
import { FirebaseAuthProvider } from '@/lib/contexts/FirebaseAuthContext';
import { MinimizedPlayground } from '@/components/playground/MinimizedPlayground';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';

export default function DashboardLayout({
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

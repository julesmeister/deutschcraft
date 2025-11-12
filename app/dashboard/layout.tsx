'use client';

import { Navbar } from '@/components/ui/Navbar';
import { MegaDropdown } from '@/components/ui/MegaDropdown';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main navbar with dashboard items - Dark variant */}
      <DashboardNavbar />

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}

function DashboardNavbar() {
  const { data: session } = useSession();

  const handleRoleSwitch = async (newRole: 'STUDENT' | 'TEACHER') => {
    if (!session?.user?.email) return;

    try {
      const userRef = doc(db, 'users', session.user.email);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: Date.now(),
      });

      // Refresh session and redirect to appropriate dashboard
      window.location.href = newRole === 'STUDENT' ? '/dashboard/student' : '/dashboard/teacher';
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 lg:py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between transition-all duration-500 bg-gray-900 text-white py-3 px-8 rounded-full shadow-lg">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="font-black text-xl text-gray-900">T</span>
            </div>
            <span className="font-black text-xl text-white">Testmanship</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            {/* Student Mega Dropdown */}
            <MegaDropdown
              trigger="Student"
              icon="📚"
              onNavigate={() => handleRoleSwitch('STUDENT')}
              highlight={{
                badge: 'Learning Dashboard',
                title: 'Track Your Progress!',
                description: 'Manage your German learning journey with AI-powered flashcards and progress tracking.',
                buttonText: 'View Dashboard',
                buttonHref: '/dashboard/student',
              }}
              columns={[
                {
                  title: 'Practice',
                  items: [
                    { label: 'Flashcards', href: '/dashboard/student/flashcards' },
                    { label: 'Writing', href: '/dashboard/student/writing' },
                    { label: 'Review', href: '/dashboard/review' },
                  ],
                },
                {
                  title: 'Progress',
                  items: [
                    { label: 'Statistics', href: '/dashboard/progress' },
                    { label: 'Achievements', href: '/dashboard/achievements', badge: 'New' },
                    { label: 'Syllabus', href: '/dashboard/student/syllabus' },
                  ],
                },
                {
                  title: 'Resources',
                  items: [
                    { label: 'Grammar Guide', href: '/resources/grammar' },
                    { label: 'Vocabulary', href: '/resources/vocabulary' },
                    { label: 'Help Center', href: '/help', external: true },
                  ],
                },
              ]}
            />

            {/* Teacher Mega Dropdown */}
            <MegaDropdown
              trigger="Teacher"
              icon="👨‍🏫"
              onNavigate={() => handleRoleSwitch('TEACHER')}
              highlight={{
                badge: 'Teacher Dashboard',
                title: 'Manage Your Students!',
                description: 'Monitor student progress, create assignments, and view detailed analytics.',
                buttonText: 'View Dashboard',
                buttonHref: '/dashboard/teacher',
              }}
              columns={[
                {
                  title: 'Management',
                  items: [
                    { label: 'Students', href: '/dashboard/teacher' },
                    { label: 'Analytics', href: '/dashboard/analytics' },
                    { label: 'Assignments', href: '/dashboard/assignments' },
                    { label: 'Course Pricing', href: '/dashboard/teacher/pricing' },
                  ],
                },
                {
                  title: 'Planning',
                  items: [
                    { label: 'Tasks', href: '/dashboard/tasks' },
                    { label: 'Schedule', href: '/dashboard/schedule' },
                    { label: 'Issues', href: '/dashboard/issue' },
                    { label: 'Calendar', href: '/dashboard/calendar' },
                    { label: 'Reports', href: '/dashboard/reports' },
                  ],
                },
                {
                  title: 'Resources',
                  items: [
                    { label: 'Materials', href: '/resources/materials' },
                    { label: 'Templates', href: '/resources/templates' },
                    { label: 'Help Center', href: '/help', external: true },
                  ],
                },
              ]}
            />

            {/* Settings Link */}
            <Link
              href="/dashboard/settings"
              className="font-bold text-[15px] text-gray-300 hover:text-piku-cyan-accent transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-cyan-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              Settings
            </Link>
          </nav>

          {/* Sign Out Button */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => import('next-auth/react').then(({ signOut }) => signOut({ callbackUrl: '/' }))}
              className="theme-btn-dark group inline-flex items-center font-black text-[14px] py-1.5 pl-5 pr-1.5 rounded-full bg-white text-gray-900"
            >
              <span className="relative z-10 transition-colors duration-300">
                Sign out
              </span>
              <span className="relative z-10 ml-4 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-400 bg-gray-900 text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

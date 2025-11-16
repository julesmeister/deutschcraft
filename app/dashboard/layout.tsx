'use client';

import { Navbar } from '@/components/ui/Navbar';
import { MegaDropdown } from '@/components/ui/MegaDropdown';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { updateUser } from '@/lib/services/userService';
import { useState } from 'react';
import { EnrollmentGuard } from '@/components/dashboard/EnrollmentGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main navbar with dashboard items - Dark variant */}
      <DashboardNavbar />

      {/* Main Content with Enrollment Protection */}
      <main className="pt-20">
        <EnrollmentGuard>
          {children}
        </EnrollmentGuard>
      </main>
    </div>
  );
}

function DashboardNavbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSwitch = async (newRole: 'STUDENT' | 'TEACHER') => {
    if (!session?.user?.email) return;

    try {
      // Update user role using service layer
      await updateUser(session.user.email, { role: newRole });

      // Refresh session and redirect to appropriate dashboard
      window.location.href = newRole === 'STUDENT' ? '/dashboard/student' : '/dashboard/teacher';
    } catch (error) {
      // Error handling - silent fail
    }
  };

  // Note: Menu items are always visible in navbar, but routes are protected by EnrollmentGuard
  // Pending users will be redirected to /dashboard/settings when clicking protected links

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 lg:py-4">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between transition-all duration-500 bg-gray-900 text-white py-2 sm:py-3 px-4 sm:px-6 lg:px-8 rounded-full shadow-lg">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="font-black text-lg sm:text-xl text-gray-900">T</span>
            </div>
            <span className="font-black text-base sm:text-lg lg:text-xl text-white">Testmanship</span>
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
                    { label: 'Review', href: '/dashboard/student/writing-review' },
                    { label: 'Playground', href: '/dashboard/playground' },
                  ],
                },
                {
                  title: 'Progress',
                  items: [
                    { label: 'Achievements', href: session?.user?.email ? `/dashboard/teacher/students/${encodeURIComponent(session.user.email)}` : '/dashboard/achievements' },
                    { label: 'Syllabus', href: '/dashboard/student/syllabus' },
                  ],
                },
                {
                  title: 'Resources',
                  items: [
                    { label: 'Grammar Guide', href: '/dashboard/student/grammar' },
                    { label: 'Vocabulary', href: '/dashboard/student/vocabulary' },
                    { label: 'Prepositions', href: '/dashboard/student/prepositions' },
                    { label: 'Letter Writing', href: '/dashboard/student/letters' },
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
                    { label: 'Enrollments', href: '/dashboard/teacher/enrollments' },
                    { label: 'Writing Review', href: '/dashboard/teacher/writing' },
                    { label: 'Analytics', href: '/dashboard/analytics' },
                    { label: 'Assignments', href: '/dashboard/assignments' },
                    { label: 'Course Pricing', href: '/dashboard/teacher/pricing' },
                    { label: 'Playground', href: '/dashboard/playground' },
                  ],
                },
                {
                  title: 'Planning',
                  items: [
                    { label: 'Tasks', href: '/dashboard/tasks' },
                    { label: 'Schedule', href: '/dashboard/schedule' },
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

          {/* Desktop Sign Out Button */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-white hover:text-piku-cyan-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 bg-gray-900 text-white rounded-2xl shadow-lg overflow-hidden animate-slide-down">
            <div className="py-4 px-5 space-y-4">
              {/* Student Section */}
              <div>
                <button
                  onClick={() => handleRoleSwitch('STUDENT')}
                  className="flex items-center gap-2 font-bold text-sm text-piku-cyan-accent mb-3"
                >
                  <span>📚</span>
                  <span>Student Dashboard</span>
                </button>
                <div className="ml-6 space-y-2">
                  <Link href="/dashboard/student/flashcards" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Flashcards
                  </Link>
                  <Link href="/dashboard/student/writing" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Writing
                  </Link>
                  <Link href="/dashboard/student/writing-review" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Review
                  </Link>
                  <Link href="/dashboard/student/vocabulary" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Vocabulary
                  </Link>
                </div>
              </div>

              {/* Teacher Section */}
              <div className="pt-3 border-t border-gray-700">
                <button
                  onClick={() => handleRoleSwitch('TEACHER')}
                  className="flex items-center gap-2 font-bold text-sm text-piku-purple mb-3"
                >
                  <span>👨‍🏫</span>
                  <span>Teacher Dashboard</span>
                </button>
                <div className="ml-6 space-y-2">
                  <Link href="/dashboard/teacher" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Students
                  </Link>
                  <Link href="/dashboard/teacher/enrollments" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Enrollments
                  </Link>
                  <Link href="/dashboard/teacher/writing" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Writing Review
                  </Link>
                  <Link href="/dashboard/analytics" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Analytics
                  </Link>
                  <Link href="/dashboard/tasks" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    Tasks
                  </Link>
                </div>
              </div>

              {/* Settings & Sign Out */}
              <div className="pt-3 border-t border-gray-700 space-y-2">
                <Link href="/dashboard/settings" className="block font-bold text-sm text-white hover:text-piku-cyan-accent transition-colors">
                  Settings
                </Link>
                <button
                  onClick={() => import('next-auth/react').then(({ signOut }) => signOut({ callbackUrl: '/' }))}
                  className="w-full text-left font-bold text-sm text-white hover:text-red-400 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

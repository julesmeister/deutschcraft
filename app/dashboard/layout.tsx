'use client';

import { Navbar } from '@/components/ui/Navbar';
import { MegaDropdown } from '@/components/ui/MegaDropdown';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { updateUser } from '@/lib/services/user';
import { useState, useEffect } from 'react';
import { EnrollmentGuard } from '@/components/dashboard/EnrollmentGuard';
import { PlaygroundSessionProvider } from '@/lib/contexts/PlaygroundSessionContext';
import { MinimizedPlayground } from '@/components/playground/MinimizedPlayground';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlaygroundSessionProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Main navbar with dashboard items - Use DashboardNavbar for mega dropdowns */}
        <DashboardNavbar />

        {/* Main Content with Enrollment Protection */}
        <main>
          <EnrollmentGuard>
            {children}
          </EnrollmentGuard>
        </main>

        {/* Minimized Playground - shows when session is active and minimized */}
        <MinimizedPlayground />
      </div>
    </PlaygroundSessionProvider>
  );
}

function DashboardNavbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Note: Menu items are always visible in navbar, but routes are protected by EnrollmentGuard
  // Pending users will be redirected to /dashboard/settings when clicking protected links

  return (
    <header className="pt-3 lg:pt-3">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Modern floating navbar with backdrop blur */}
        <div className={`w-full flex items-center justify-between transition-all duration-500 ease-out bg-gray-900/95 text-white backdrop-blur-md border rounded-2xl py-2.5 px-4 lg:py-3 lg:px-8
          ${isScrolled
            ? 'border-gray-700/60 shadow-lg'
            : 'border-transparent shadow-none'
          }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="font-black text-lg sm:text-xl text-gray-900">T</span>
            </div>
            <span className="font-black text-base sm:text-lg lg:text-xl text-white">Testmanship</span>
          </Link>

          {/* Desktop Navigation with separator */}
          <div className="hidden lg:flex items-center flex-1 justify-end gap-8">
            {/* Vertical separator */}
            <div className="h-4 w-px bg-gray-600/60"></div>

            <nav className="flex items-center space-x-10">
            {/* Student Mega Dropdown */}
            <MegaDropdown
              trigger="Student"
              icon="📚"
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
                    { label: 'Grammatik', href: '/dashboard/student/grammatik' },
                    { label: 'Writing', href: '/dashboard/student/writing' },
                    { label: 'Audios', href: '/dashboard/student/audios' },
                    { label: 'Playground', href: '/dashboard/playground' },
                  ],
                },
                {
                  title: 'Progress',
                  items: [
                    { label: 'Achievements', href: session?.user?.email ? `/dashboard/teacher/students/${encodeURIComponent(session.user.email)}` : '/dashboard/achievements' },
                    { label: 'Answer Hub', href: '/dashboard/student/answer-hub' },
                    { label: 'Writings', href: '/dashboard/student/writings' },
                    { label: 'Syllabus', href: '/dashboard/student/syllabus' },
                    { label: 'Schedule', href: '/dashboard/schedule' },
                    { label: 'Analytics', href: '/dashboard/analytics' },
                  ],
                },
                {
                  title: 'Resources',
                  items: [
                    { label: 'Dictionary', href: '/dashboard/dictionary' },
                    { label: 'Grammar Guide', href: '/dashboard/student/grammar' },
                    { label: 'Vocabulary', href: '/dashboard/student/vocabulary' },
                    { label: 'Redemittel', href: '/dashboard/student/redemittel' },
                    { label: 'Prepositions', href: '/dashboard/student/prepositions' },
                    { label: 'Letter Writing', href: '/dashboard/student/letters' },
                    { label: 'Videos', href: '/dashboard/student/videos' },
                    { label: 'Help Center', href: '/help', external: true },
                  ],
                },
              ]}
            />

            {/* Teacher Mega Dropdown */}
            <MegaDropdown
              trigger="Teacher"
              icon="👨‍🏫"
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
                    { label: 'Answer Hub', href: '/dashboard/student/answer-hub' },
                    { label: 'Analytics', href: '/dashboard/analytics' },
                    { label: 'Assignments', href: '/dashboard/assignments' },
                    { label: 'Playground', href: '/dashboard/playground' },
                  ],
                },
                {
                  title: 'Planning',
                  items: [
                    { label: 'Tasks', href: '/dashboard/tasks' },
                    { label: 'Schedule', href: '/dashboard/schedule' },
                    { label: 'Calendar', href: '/dashboard/calendar' },
                    { label: 'Course Pricing', href: '/dashboard/teacher/pricing' },
                    { label: 'Reports', href: '/dashboard/reports' },
                    { label: 'Role Management', href: '/dashboard/teacher/roles' },
                  ],
                },
                {
                  title: 'Resources',
                  items: [
                    { label: 'Dictionary', href: '/dashboard/dictionary' },
                    { label: 'Redemittel', href: '/dashboard/student/redemittel' },
                    { label: 'Videos', href: '/dashboard/student/videos' },
                    { label: 'Materials', href: '/resources/materials' },
                    { label: 'Templates', href: '/resources/templates' },
                    { label: 'Help Center', href: '/help', external: true },
                  ],
                },
              ]}
            />

              {/* Social Link */}
              <Link
                href={session?.user ? (session.user.email && session.user.email.includes('@') ? '/dashboard/social' : '/dashboard/social') : '/dashboard/social'}
                className="font-semibold text-sm text-gray-300 hover:text-piku-mint transition-all duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-mint after:transition-all after:duration-300 hover:after:w-full"
              >
                Social
              </Link>

              {/* Settings Link */}
              <Link
                href="/dashboard/settings"
                className="font-semibold text-sm text-gray-300 hover:text-piku-cyan-accent transition-all duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-cyan-accent after:transition-all after:duration-300 hover:after:w-full"
              >
                Settings
              </Link>
            </nav>

            {/* Desktop Sign Out Button */}
            <div className="flex items-center">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-800 active:bg-gray-700"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="container mx-auto px-4 sm:px-6">
          <div className="lg:hidden mt-3 bg-gray-900/95 text-white backdrop-blur-md border border-gray-700/60 rounded-2xl shadow-lg overflow-hidden animate-slide-down">
            <div className="py-4 px-3 space-y-4">
              {/* Student Section */}
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-piku-cyan-accent mb-2 px-3">
                  <span>📚</span>
                  <span>Student Dashboard</span>
                </div>
                <div className="space-y-1">
                  <Link href="/dashboard/student/flashcards" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Flashcards
                  </Link>
                  <Link href="/dashboard/student/grammatik" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Grammatik
                  </Link>
                  <Link href="/dashboard/student/writing" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Writing
                  </Link>
                  <Link href="/dashboard/student/audios" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Audios
                  </Link>
                  <Link href="/dashboard/student/answer-hub" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Answer Hub
                  </Link>
                  <Link href="/dashboard/dictionary" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Dictionary
                  </Link>
                  <Link href="/dashboard/student/vocabulary" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Vocabulary
                  </Link>
                  <Link href="/dashboard/student/redemittel" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Redemittel
                  </Link>
                  <Link href="/dashboard/student/videos" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Videos
                  </Link>
                  <Link href="/dashboard/analytics" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Analytics
                  </Link>
                </div>
              </div>

              {/* Teacher Section */}
              <div className="pt-2 border-t border-gray-700/50">
                <div className="flex items-center gap-2 font-bold text-sm text-piku-purple mb-2 mt-2 px-3">
                  <span>👨‍🏫</span>
                  <span>Teacher Dashboard</span>
                </div>
                <div className="space-y-1">
                  <Link href="/dashboard/teacher" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Students
                  </Link>
                  <Link href="/dashboard/teacher/enrollments" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Enrollments
                  </Link>
                  <Link href="/dashboard/teacher/writing" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Writing Review
                  </Link>
                  <Link href="/dashboard/student/answer-hub" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Answer Hub
                  </Link>
                  <Link href="/dashboard/dictionary" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Dictionary
                  </Link>
                  <Link href="/dashboard/student/videos" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Videos
                  </Link>
                  <Link href="/dashboard/analytics" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Analytics
                  </Link>
                  <Link href="/dashboard/tasks" className="block text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                    Tasks
                  </Link>
                </div>
              </div>

              {/* Settings & Sign Out */}
              <div className="pt-2 border-t border-gray-700/50 space-y-1 mt-2">
                <Link href="/dashboard/social" className="block font-semibold text-sm text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                  Social
                </Link>
                <Link href="/dashboard/settings" className="block font-semibold text-sm text-white hover:bg-gray-800 rounded-lg py-2.5 px-3 transition-colors">
                  Settings
                </Link>
                <button
                  onClick={() => import('next-auth/react').then(({ signOut }) => signOut({ callbackUrl: '/' }))}
                  className="w-full text-left font-semibold text-sm text-white hover:bg-red-900/30 rounded-lg py-2.5 px-3 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

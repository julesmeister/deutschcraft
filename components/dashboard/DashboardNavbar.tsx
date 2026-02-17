'use client';

import { MegaDropdown } from '@/components/ui/MegaDropdown';
import { AccountSwitcher } from '@/components/ui/AccountSwitcher';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { updateUser } from '@/lib/services/user';
import { useState, useEffect } from 'react';
import { studentMenuConfig, teacherMenuConfig } from '@/app/dashboard/layout/menuConfig';
import { MobileMenu } from '@/app/dashboard/layout/MobileMenu';
import { NavbarLogo } from '@/app/dashboard/layout/NavbarLogo';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { useTeacherDisplaySettings } from '@/lib/hooks/useTeacherDisplaySettings';

export function DashboardNavbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Use session role (from JWT, available instantly) to avoid flicker
  const sessionRole = (session?.user as any)?.role?.toUpperCase();

  // Firestore data for teacher display settings (only needed for students with a teacherId)
  const { student: currentUser } = useCurrentStudent(session?.user?.email || null);
  const { showTeacherTab } = useTeacherDisplaySettings(currentUser?.teacherId, currentUser?.role);

  const isTeacher = sessionRole === 'TEACHER';

  const handleRoleSwitch = async (newRole: 'STUDENT' | 'TEACHER') => {
    if (!session?.user?.email) return;

    try {
      await updateUser(session.user.email, { role: newRole });
      window.location.href = newRole === 'STUDENT' ? '/dashboard/student' : '/dashboard/teacher';
    } catch (error) {
      // Silent fail
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update achievements href with session email
  const updatedStudentConfig = {
    ...studentMenuConfig,
    columns: studentMenuConfig.columns.map(col => ({
      ...col,
      items: col.items.map(item =>
        item.label === 'Achievements' && session?.user?.email
          ? { ...item, href: `/dashboard/teacher/students/${encodeURIComponent(session.user.email)}` }
          : item
      )
    }))
  };

  return (
    <header className="pt-3 lg:pt-3 relative z-[100]">
      <div className="container mx-auto px-4 sm:px-6 relative z-[100]">
        <div data-navbar className={`w-full flex items-center justify-between transition-all duration-500 ease-out bg-white/95 backdrop-blur-md border rounded-2xl py-2.5 px-4 lg:py-3 lg:px-8
          ${isScrolled
            ? 'border-gray-200/60 shadow-lg'
            : 'border-transparent shadow-none'
          }`}>
          <NavbarLogo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-1 justify-end gap-8 z-[100]">
            <div className="h-4 w-px bg-gray-200/80"></div>

            <nav className="flex items-center space-x-10">
              <Link
                href={isTeacher ? '/dashboard/teacher' : '/dashboard/student'}
                className="font-semibold text-[15px] text-gray-700 hover:text-gray-900 transition-all duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-purple-dark after:transition-all after:duration-300 hover:after:w-full"
              >
                Dashboard
              </Link>

              {isTeacher
                ? <MegaDropdown {...teacherMenuConfig} />
                : <MegaDropdown {...updatedStudentConfig} />
              }
              {!isTeacher && showTeacherTab && (
                <MegaDropdown {...teacherMenuConfig} />
              )}

              <Link
                href="/dashboard/social"
                className="font-semibold text-[15px] text-gray-700 hover:text-gray-900 transition-all duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-purple-dark after:transition-all after:duration-300 hover:after:w-full"
              >
                Social
              </Link>

              <Link
                href="/dashboard/settings"
                className="font-semibold text-[15px] text-gray-700 hover:text-gray-900 transition-all duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-purple-dark after:transition-all after:duration-300 hover:after:w-full"
              >
                Settings
              </Link>
            </nav>

            <div className="flex items-center">
              <AccountSwitcher
                currentUserEmail={session?.user?.email}
                currentUserName={session?.user?.name}
                currentUserImage={session?.user?.image}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 active:bg-gray-200"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        showTeacherTab={isTeacher || showTeacherTab}
      />
    </header>
  );
}

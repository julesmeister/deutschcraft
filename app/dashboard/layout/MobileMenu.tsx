import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
}

export function MobileMenu({ isOpen }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
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
  );
}

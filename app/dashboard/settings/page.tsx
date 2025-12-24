'use client';

import { SettingsSidebar } from '@/components/ui/settings/SettingsSidebar';
import { ProfileTab } from '@/components/ui/settings/ProfileTab';
import { SecurityTab } from '@/components/ui/settings/SecurityTab';
import { NotificationTab } from '@/components/ui/settings/NotificationTab';
import { FlashcardSettingsTab } from '@/components/ui/settings/FlashcardSettingsTab';
import { IntegrationTab } from '@/components/ui/settings/IntegrationTab';
import { EnrollmentTab } from '@/components/ui/settings/EnrollmentTab';
import { EnrollmentPendingTab } from '@/components/ui/settings/EnrollmentPendingTab';
import { DatabaseMigrationTab } from '@/components/ui/settings/DatabaseMigrationTab';
import { CatLoader } from '@/components/ui/CatLoader';
import { useSettingsData } from '@/lib/hooks/useSettingsData';
import { useProfileForm } from '@/lib/hooks/useProfileForm';
import { useEnrollmentForm } from '@/lib/hooks/useEnrollmentForm';
import { useSettingsRefresh } from '@/lib/hooks/useSettingsRefresh';
import { getSettingsMenuItems } from '@/components/ui/settings/getSettingsMenuItems';

export default function SettingsPage() {
  const {
    session,
    status,
    currentUser,
    isLoading,
    isPending,
    activeTab,
    setActiveTab,
    saveMessage,
    setSaveMessage,
  } = useSettingsData();

  // Show info bar if user is pending OR if they might have stale session data
  const showRedirectInfo = isPending || (currentUser && currentUser.role === 'STUDENT' && typeof window !== 'undefined');

  const {
    formData,
    setFormData,
    isSaving: profileSaving,
    handleSubmit: handleProfileSubmit,
  } = useProfileForm(currentUser, session);

  const {
    isSaving: enrollmentSaving,
    handleEnrollmentSubmit,
    handleDeleteAccount,
  } = useEnrollmentForm(session);

  const { handleRefresh } = useSettingsRefresh();

  // Build menu items
  const menuItems = getSettingsMenuItems(isPending, activeTab, setActiveTab);

  // Show loading while fetching user data or if not authenticated
  if (status === 'loading' || isLoading) {
    return <CatLoader fullScreen message="Loading settings..." />;
  }

  // If not authenticated, don't render anything (middleware will redirect)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Settings ⚙️</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>
            {/* Refresh Button */}
            <button
              onClick={() => handleRefresh(session?.user?.email)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh data from server"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar - Show when user is pending approval or has stale session */}
      {showRedirectInfo && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                {isPending ? (
                  <>
                    <p className="text-sm font-medium text-blue-800">
                      {currentUser?.enrollmentStatus === 'pending'
                        ? 'Your enrollment is pending teacher approval.'
                        : 'Your account is pending approval.'}
                    </p>
                    <p className="text-sm text-blue-700 mt-0.5">
                      {currentUser?.enrollmentStatus === 'pending'
                        ? 'Your teacher will review your enrollment soon. You will be notified once approved.'
                        : 'Please complete your enrollment in the Enrollment tab to access all dashboard features.'}
                    </p>
                  </>
                ) : currentUser?.role === 'STUDENT' ? (
                  <>
                    <p className="text-sm font-medium text-blue-800">
                      You were redirected to Settings because your session data is outdated.
                    </p>
                    <p className="text-sm text-blue-700 mt-0.5">
                      Please sign out and sign back in to refresh your session and access the Student Dashboard.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-blue-800">
                      You were redirected to Settings.
                    </p>
                    <p className="text-sm text-blue-700 mt-0.5">
                      If you're having trouble accessing the dashboard, try signing out and signing back in.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex h-full gap-6">
            {/* Sidebar */}
            <SettingsSidebar items={menuItems} />

            {/* Content Area */}
            <div className="flex-1 xl:pl-6 py-2">
              {/* Mobile Menu Button */}
              <div className="mb-6 lg:hidden">
                <button className="p-1.5 bg-gray-100 rounded-full text-xl">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    height="1em"
                    width="1em"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h7"
                    ></path>
                  </svg>
                </button>
              </div>

              {/* Enrollment Tab - Only for pending users */}
              {activeTab === 'enrollment' && isPending && (
                <>
                  {/* Show enrollment form for new users, pending status for submitted users */}
                  {currentUser && currentUser.enrollmentStatus === 'pending' ? (
                    <EnrollmentPendingTab user={currentUser} />
                  ) : (
                    <EnrollmentTab
                      onSubmit={(data) =>
                        handleEnrollmentSubmit(
                          data,
                          setSaveMessage,
                          setSaveMessage,
                          () => setActiveTab('enrollment')
                        )
                      }
                      isSaving={enrollmentSaving}
                    />
                  )}
                </>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <ProfileTab
                  formData={formData}
                  onFormDataChange={setFormData}
                  onSubmit={(e) => handleProfileSubmit(e, setSaveMessage, setSaveMessage)}
                  isSaving={profileSaving}
                  userPhotoURL={session?.user?.image || currentUser?.photoURL || undefined}
                  userRole={currentUser?.role}
                  onDeleteAccount={() => handleDeleteAccount(setSaveMessage)}
                />
              )}

              {/* Security Tab */}
              {activeTab === 'security' && <SecurityTab />}

              {/* Notification Tab - Only for approved users */}
              {activeTab === 'notification' && !isPending && <NotificationTab />}

              {/* Flashcard Settings Tab - Only for approved users */}
              {activeTab === 'flashcards' && !isPending && <FlashcardSettingsTab />}

              {/* Integration Tab - Only for approved users */}
              {activeTab === 'integration' && !isPending && <IntegrationTab />}

              {/* Database Migration Tab - Only for approved users */}
              {activeTab === 'migration' && !isPending && <DatabaseMigrationTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

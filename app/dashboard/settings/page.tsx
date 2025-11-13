'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsSidebar, SettingsMenuItem } from '@/components/ui/settings/SettingsSidebar';
import { ProfileTab } from '@/components/ui/settings/ProfileTab';
import { SecurityTab } from '@/components/ui/settings/SecurityTab';
import { NotificationTab } from '@/components/ui/settings/NotificationTab';
import { FlashcardSettingsTab } from '@/components/ui/settings/FlashcardSettingsTab';
import { IntegrationTab } from '@/components/ui/settings/IntegrationTab';
import { CatLoader } from '@/components/ui/CatLoader';
import { useFirebaseAuth } from '@/lib/hooks/useFirebaseAuth';
import { useCurrentStudent } from '@/lib/hooks/useUsers';
import { updateUser } from '@/lib/services/userService';

type SettingsTab = 'profile' | 'security' | 'notification' | 'flashcards' | 'integration';

export default function SettingsPage() {
  const router = useRouter();
  const { session, status } = useFirebaseAuth();
  const { student: currentUser, isLoading } = useCurrentStudent(session?.user?.email || null);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dialCode: '+1',
    country: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load user data from Firestore
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || session?.user?.email || '',
        phoneNumber: (currentUser as any).phoneNumber || '',
        dialCode: (currentUser as any).dialCode || '+1',
        country: (currentUser as any).country || '',
        address: (currentUser as any).address || '',
        city: (currentUser as any).city || '',
        postalCode: (currentUser as any).postalCode || '',
      });
    }
  }, [currentUser, session]);

  const menuItems: SettingsMenuItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
        >
          <path d="M9 10a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
          <path d="M6 21v-1a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v1"></path>
          <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z"></path>
        </svg>
      ),
      active: activeTab === 'profile',
      onClick: () => setActiveTab('profile'),
    },
    {
      id: 'security',
      label: 'Security',
      icon: (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
        >
          <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path>
          <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
          <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
        </svg>
      ),
      active: activeTab === 'security',
      onClick: () => setActiveTab('security'),
    },
    {
      id: 'notification',
      label: 'Notification',
      icon: (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
        >
          <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"></path>
          <path d="M9 17v1a3 3 0 0 0 6 0v-1"></path>
        </svg>
      ),
      active: activeTab === 'notification',
      onClick: () => setActiveTab('notification'),
    },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
        >
          <path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
          <path d="M7 21h10"></path>
          <path d="M9 18v3"></path>
          <path d="M15 18v3"></path>
        </svg>
      ),
      active: activeTab === 'flashcards',
      onClick: () => setActiveTab('flashcards'),
    },
    {
      id: 'integration',
      label: 'Integration',
      icon: (
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="1em"
          width="1em"
        >
          <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
          <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
          <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
        </svg>
      ),
      active: activeTab === 'integration',
      onClick: () => setActiveTab('integration'),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setSaveMessage('Error: User not found');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      // Update Firestore with new data using email as identifier
      await updateUser(formData.email, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dialCode: formData.dialCode,
        country: formData.country,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      } as any);

      setSaveMessage('Settings saved successfully!');

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('[Settings] Failed to save:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while fetching user data
  if (status === 'loading' || isLoading) {
    return <CatLoader fullScreen message="Loading settings..." />;
  }

  // Redirect if not authenticated
  if (!session?.user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-black text-gray-900">Settings ⚙️</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>

          {/* Save Message */}
          {saveMessage && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                saveMessage.includes('success')
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {saveMessage}
            </div>
          )}
        </div>
      </div>

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

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <ProfileTab
                  formData={formData}
                  onFormDataChange={setFormData}
                  onSubmit={handleSubmit}
                  isSaving={isSaving}
                  userPhotoURL={session?.user?.image || currentUser?.photoURL || undefined}
                />
              )}

              {/* Security Tab */}
              {activeTab === 'security' && <SecurityTab />}

              {/* Notification Tab */}
              {activeTab === 'notification' && <NotificationTab />}

              {/* Flashcard Settings Tab */}
              {activeTab === 'flashcards' && <FlashcardSettingsTab />}

              {/* Integration Tab */}
              {activeTab === 'integration' && <IntegrationTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

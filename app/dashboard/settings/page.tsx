'use client';

import { useState } from 'react';
import { SettingsSidebar, SettingsMenuItem } from '@/components/ui/settings/SettingsSidebar';
import { ProfileTab } from '@/components/ui/settings/ProfileTab';
import { SecurityTab } from '@/components/ui/settings/SecurityTab';
import { NotificationTab } from '@/components/ui/settings/NotificationTab';
import { BillingTab } from '@/components/ui/settings/BillingTab';
import { IntegrationTab } from '@/components/ui/settings/IntegrationTab';

type SettingsTab = 'profile' | 'security' | 'notification' | 'billing' | 'integration';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [formData, setFormData] = useState({
    firstName: 'Angelina',
    lastName: 'Gotelli',
    email: 'carolyn_h@hotmail.com',
    phoneNumber: '121231234',
    dialCode: '+1',
    country: 'US',
    address: '123 Main St',
    city: 'New York',
    postalCode: '10001',
  });

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
      id: 'billing',
      label: 'Billing',
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
          <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
          <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
          <path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5"></path>
          <path d="M12 17v1m0 -8v1"></path>
        </svg>
      ),
      active: activeTab === 'billing',
      onClick: () => setActiveTab('billing'),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-black text-gray-900">Settings ⚙️</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
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
                />
              )}

              {/* Security Tab */}
              {activeTab === 'security' && <SecurityTab />}

              {/* Notification Tab */}
              {activeTab === 'notification' && <NotificationTab />}

              {/* Billing Tab */}
              {activeTab === 'billing' && <BillingTab />}

              {/* Integration Tab */}
              {activeTab === 'integration' && <IntegrationTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

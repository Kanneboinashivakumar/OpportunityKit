'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  User,
  Bell,
  Sliders,
  Shield,
  Link as LinkIcon,
  Mail,
  Calendar,
  FileText,
  Sparkles,
  BarChart2,
  Megaphone,
  Monitor,
  CheckCircle2,
  Loader2,
  LogOut,
  ArrowRight,
} from 'lucide-react';

type Tab = 'Account' | 'Notifications' | 'Preferences' | 'Privacy' | 'Connected Accounts';

interface NotificationSettings {
  newOpportunities: boolean;
  deadlineReminders: boolean;
  applicationUpdates: boolean;
  personalizedRecommendations: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  inApp: boolean;
  email: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  newOpportunities: true,
  deadlineReminders: true,
  applicationUpdates: true,
  personalizedRecommendations: true,
  weeklyDigest: true,
  productUpdates: false,
  inApp: true,
  email: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>('Notifications');
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [userEmail, setUserEmail] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user data and existing preferences
  useEffect(() => {
    async function loadUser() {
      try {
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setUserEmail(user.email);

        const res = await fetch('/api/profile');
        if (res.ok) {
          const d = await res.json();
          const savedNotifs = d.profile?.preferences?.notification_settings;
          if (savedNotifs) {
            setSettings((prev) => ({ ...prev, ...savedNotifs }));
          }
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    loadUser();
  }, [supabase]);

  const toggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaveSuccess(false);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: { notification_settings: settings },
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#16233B] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#555B64] mt-1 font-normal">
          Manage your account, notifications, and preferences.
        </p>
      </div>

      {/* Tabs Navigation (Image 5 Right) */}
      <div className="flex items-center gap-6 border-b border-[#E8E4DC] overflow-x-auto scrollbar-none">
        {[
          { tab: 'Account' as Tab, icon: User },
          { tab: 'Notifications' as Tab, icon: Bell },
          { tab: 'Preferences' as Tab, icon: Sliders },
          { tab: 'Privacy' as Tab, icon: Shield },
          { tab: 'Connected Accounts' as Tab, icon: LinkIcon },
        ].map(({ tab, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 flex items-center gap-2 text-sm font-medium transition-all relative whitespace-nowrap ${
                isActive
                  ? 'text-[#2D5542] font-semibold'
                  : 'text-[#777D85] hover:text-[#16233B]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D5542]' : 'text-[#999DA3]'}`} />
              <span>{tab}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5542] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Notifications (Image 5 Right Reference) */}
      {activeTab === 'Notifications' && (
        <div className="space-y-8 pt-2">
          {/* Section 1: Notification Preferences */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#16233B]">
                Notification Preferences
              </h2>
              <p className="text-xs text-[#777D85] mt-0.5">
                Choose what updates you want to receive.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E4DC] bg-white divide-y divide-[#E8E4DC] shadow-2xs">
              {[
                {
                  key: 'newOpportunities' as const,
                  icon: Mail,
                  title: 'New Opportunities',
                  description: 'Get notified when new opportunities match your profile.',
                },
                {
                  key: 'deadlineReminders' as const,
                  icon: Calendar,
                  title: 'Deadline Reminders',
                  description: 'Receive reminders before application deadlines.',
                },
                {
                  key: 'applicationUpdates' as const,
                  icon: FileText,
                  title: 'Application Updates',
                  description: 'Get updates on the status of your applications.',
                },
                {
                  key: 'personalizedRecommendations' as const,
                  icon: Sparkles,
                  title: 'Personalized Recommendations',
                  description: 'Receive AI-based recommendations based on your profile.',
                },
                {
                  key: 'weeklyDigest' as const,
                  icon: BarChart2,
                  title: 'Weekly Digest',
                  description: 'Get a weekly summary of new opportunities and updates.',
                },
                {
                  key: 'productUpdates' as const,
                  icon: Megaphone,
                  title: 'Product Updates',
                  description: 'Be the first to know about new features and improvements.',
                },
              ].map(({ key, icon: Icon, title, description }) => (
                <div
                  key={key}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FAF9F5]/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#555B64]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#16233B]">{title}</h3>
                      <p className="text-xs text-[#777D85] mt-0.5">{description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings[key]}
                    onClick={() => toggle(key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings[key] ? 'bg-[#2D5542]' : 'bg-[#E8E4DC]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings[key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Notification Channels */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#16233B]">
                Notification Channels
              </h2>
              <p className="text-xs text-[#777D85] mt-0.5">
                Choose how you want to receive notifications.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E4DC] bg-white divide-y divide-[#E8E4DC] shadow-2xs">
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-center shrink-0">
                    <Monitor className="w-4 h-4 text-[#555B64]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#16233B]">In-App Notifications</h3>
                    <p className="text-xs text-[#777D85] mt-0.5">Receive notifications within the platform.</p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.inApp}
                  onClick={() => toggle('inApp')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.inApp ? 'bg-[#2D5542]' : 'bg-[#E8E4DC]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.inApp ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#555B64]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#16233B]">Email Notifications</h3>
                    <p className="text-xs text-[#777D85] mt-0.5">Receive important updates via email.</p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.email}
                  onClick={() => toggle('email')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.email ? 'bg-[#2D5542]' : 'bg-[#E8E4DC]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.email ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5542] bg-[#E9F0EB] px-3 py-1.5 rounded-lg border border-[#C6DEC9]">
                  <CheckCircle2 className="w-4 h-4" />
                  Preferences saved successfully
                </span>
              )}
            </div>

            <Button
              onClick={handleSavePreferences}
              disabled={saving}
              className="bg-[#16233B] hover:bg-[#20304C] text-white px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm h-auto flex items-center gap-2 shadow-sm ml-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span>Save Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Tab 2: Account */}
      {activeTab === 'Account' && (
        <div className="space-y-6 pt-2">
          <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#16233B]">Account Information</h2>
            <div className="space-y-2">
              <p className="text-xs text-[#777D85]">Logged in Email Address</p>
              <p className="text-sm font-semibold text-[#16233B] bg-[#FAF9F5] p-3 rounded-xl border border-[#E8E4DC]">
                {userEmail || 'Active user'}
              </p>
            </div>
            <p className="text-xs text-[#777D85]">
              Authenticated via Supabase Auth with Row Level Security (RLS) enabled.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-semibold text-[#16233B]">Session Management</h2>
            <p className="text-xs text-[#777D85]">
              Sign out from this device to end your active workspace session.
            </p>
            <Button
              variant="outline"
              onClick={signOut}
              className="border-[#FECACA] text-[#DC2626] hover:bg-[#FEE2E2] rounded-xl text-xs gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Tab 3: Preferences */}
      {activeTab === 'Preferences' && (
        <div className="space-y-6 pt-2">
          <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#16233B]">Display & Theme</h2>
            <div className="space-y-2">
              <p className="text-xs text-[#777D85]">Palette Mode</p>
              <div className="p-3 rounded-xl border border-[#E8E4DC] bg-[#FAF9F5] flex items-center justify-between text-xs text-[#16233B]">
                <span className="font-semibold">Warm Ivory & Deep Navy (Restrained Editorial SaaS)</span>
                <span className="text-[#2D5542] font-semibold">Default</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Privacy */}
      {activeTab === 'Privacy' && (
        <div className="space-y-6 pt-2">
          <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-3">
            <h2 className="text-base font-semibold text-[#16233B]">Data Protection & Privacy</h2>
            <p className="text-xs text-[#555B64] leading-relaxed">
              Your profile data, resume parses, and eligibility audits are stored with Row Level Security (RLS) in your PostgreSQL database.
              Your data is only accessed by your authenticated user session.
            </p>
            <p className="text-xs text-[#555B64] leading-relaxed">
              When analyzing announcements, text is processed securely server-side through the configured Gemini API. No student identifying information is shared with third parties.
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Connected Accounts */}
      {activeTab === 'Connected Accounts' && (
        <div className="space-y-6 pt-2">
          <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-semibold text-[#16233B]">OAuth Providers</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E4DC] bg-[#FAF9F5]">
                <span className="text-xs font-semibold text-[#16233B]">Google</span>
                <span className="text-xs font-medium text-[#2D5542] bg-[#E9F0EB] px-2.5 py-1 rounded-full">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E8E4DC] bg-[#FAF9F5]">
                <span className="text-xs font-semibold text-[#16233B]">GitHub</span>
                <span className="text-xs font-medium text-[#2D5542] bg-[#E9F0EB] px-2.5 py-1 rounded-full">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

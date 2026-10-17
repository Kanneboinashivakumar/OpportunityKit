'use client';

import { useState, useMemo } from 'react';
import {
  Bell,
  Check,
  MoreVertical,
  Calendar,
  Briefcase,
  FileCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  category: 'Opportunities' | 'Deadlines' | 'Applications' | 'System';
  title: string;
  message: string;
  time: string;
  group: 'Today' | 'Yesterday' | 'Earlier';
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'Opportunities',
    title: 'New opportunity matched for you',
    message: 'Google Summer Internship 2025 matches your profile eligibility criteria.',
    time: '2 hours ago',
    group: 'Today',
    read: false,
    link: '/app/opportunities',
  },
  {
    id: 'notif-2',
    category: 'Deadlines',
    title: 'Application deadline reminder',
    message: 'Microsoft Learn Student Ambassador deadline is in 3 days.',
    time: '5 hours ago',
    group: 'Today',
    read: false,
    link: '/app/opportunities',
  },
  {
    id: 'notif-3',
    category: 'Applications',
    title: 'Application status updated',
    message: 'Your application for Adobe India Hackathon 2025 is under review.',
    time: '8 hours ago',
    group: 'Today',
    read: false,
    link: '/app/opportunities',
  },
  {
    id: 'notif-4',
    category: 'Opportunities',
    title: 'New opportunity in your saved category',
    message: 'NVIDIA Student Developer Program is now open for engineering students.',
    time: '10 hours ago',
    group: 'Today',
    read: false,
    link: '/app/analyze',
  },
  {
    id: 'notif-5',
    category: 'Opportunities',
    title: 'New recommendation available',
    message: 'Based on your profile, we identified new opportunities matching your CGPA & branch.',
    time: '1 day ago',
    group: 'Yesterday',
    read: true,
    link: '/app',
  },
  {
    id: 'notif-6',
    category: 'Deadlines',
    title: 'Deadline approaching',
    message: 'ISRO Student Research Programme deadline is in 5 days.',
    time: '1 day ago',
    group: 'Yesterday',
    read: true,
    link: '/app/opportunities',
  },
  {
    id: 'notif-7',
    category: 'System',
    title: 'Weekly digest is ready',
    message: 'Your weekly opportunity summary and eligibility metrics report is now available.',
    time: '1 day ago',
    group: 'Yesterday',
    read: true,
    link: '/app',
  },
  {
    id: 'notif-8',
    category: 'System',
    title: 'Profile update reminder',
    message: 'Complete your skills and GitHub profile to unlock higher confidence audits.',
    time: '3 days ago',
    group: 'Earlier',
    read: true,
    link: '/app/profile',
  },
];

const TABS = ['All', 'Opportunities', 'Deadlines', 'Applications', 'System'] as const;
type TabType = (typeof TABS)[number];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = useMemo(() => {
    if (activeTab === 'All') return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  const groups = ['Today', 'Yesterday', 'Earlier'] as const;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Deadlines':
        return <Calendar className="w-4 h-4 text-[#2D5542]" />;
      case 'Opportunities':
        return <Briefcase className="w-4 h-4 text-[#2D5542]" />;
      case 'Applications':
        return <FileCheck className="w-4 h-4 text-[#2D5542]" />;
      case 'System':
        return <Sparkles className="w-4 h-4 text-[#2D5542]" />;
      default:
        return <Bell className="w-4 h-4 text-[#2D5542]" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="space-y-6 max-w-4xl pb-16"
      onClick={() => setMenuOpenId(null)}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#16233B] tracking-tight">
          Notifications
        </h1>
        <p className="text-sm text-[#555B64] mt-1 font-normal">
          Stay updated on opportunities, deadlines, and important updates.
        </p>
      </div>

      {/* Tabs & Mark All As Read (Image 5 Left) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E4DC] gap-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                  isActive
                    ? 'text-[#2D5542] font-semibold'
                    : 'text-[#777D85] hover:text-[#16233B]'
                }`}
              >
                {tab}
                {tab === 'All' && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#E9F0EB] text-[#2D5542] text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5542] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={markAllAsRead}
          className="pb-3 sm:pb-3 flex items-center gap-1.5 text-xs font-semibold text-[#2D5542] hover:text-[#203D30] transition-colors self-end sm:self-auto"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Grouped Notifications List */}
      <div className="space-y-8 pt-2">
        {groups.map((group) => {
          const itemsInGroup = filtered.filter((n) => n.group === group);
          if (itemsInGroup.length === 0) return null;

          return (
            <div key={group} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#999DA3] px-1">
                {group}
              </h2>

              <div className="space-y-2.5">
                {itemsInGroup.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all p-4 sm:p-5 flex items-start gap-4 shadow-2xs relative ${
                      item.read
                        ? 'bg-white border-[#E8E4DC] hover:border-[#D5CFBF]'
                        : 'bg-[#FAF9F5] border-[#D5CFBF] hover:border-[#2D5542]/50'
                    }`}
                  >
                    {/* Icon container */}
                    <div className="w-10 h-10 rounded-xl bg-[#E9F0EB] flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>

                    {/* Notification content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#16233B] leading-tight">
                          {item.title}
                        </h3>
                        {!item.read && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#2D5542] shrink-0"
                            title="Unread"
                          />
                        )}
                      </div>
                      <p className="text-xs text-[#555B64] leading-relaxed">
                        {item.message}
                      </p>
                      <p className="text-[11px] text-[#999DA3] pt-0.5">{item.time}</p>
                    </div>

                    {/* Right action menu */}
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === item.id ? null : item.id);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-[#FAF9F5] text-[#999DA3] hover:text-[#16233B] flex items-center justify-center transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenId === item.id && (
                        <div
                          className="absolute right-0 mt-1 w-36 rounded-xl border border-[#E8E4DC] bg-white shadow-lg p-1.5 z-20 text-xs text-[#555B64] space-y-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              toggleRead(item.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9F5]"
                          >
                            {item.read ? 'Mark unread' : 'Mark as read'}
                          </button>
                          <button
                            onClick={() => {
                              deleteNotification(item.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#DC2626]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#E8E4DC] p-16 text-center space-y-2 bg-white">
            <Info className="w-8 h-8 text-[#999DA3] mx-auto stroke-1" />
            <p className="text-sm font-semibold text-[#16233B]">No notifications found</p>
            <p className="text-xs text-[#777D85]">
              You don&apos;t have any updates under this category right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

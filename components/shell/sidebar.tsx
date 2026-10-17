'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand/logo';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  User,
  Bookmark,
  Bell,
  Settings,
  HelpCircle,
  Building2,
} from 'lucide-react';

const mainNavItems = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/analyze', label: 'Analyze', icon: Search },
  { href: '/app/opportunities', label: 'My Opportunities', icon: Briefcase },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/saved', label: 'Saved', icon: Bookmark },
  { href: '/app/notifications', label: 'Notifications', icon: Bell },
  { href: '/app/campus-tpo', label: 'Campus TPO', icon: Building2 },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-[#E8E4DC] bg-[#FAF9F5] select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-[#E8E4DC]">
        <Link href="/app" className="flex items-center gap-2">
          <BrandLogo className="w-[172px]" />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/app' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#E9F0EB] text-[#2D5542] font-semibold shadow-2xs'
                  : 'text-[#555B64] hover:bg-[#F2ECE3] hover:text-[#20242B]'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#2D5542]' : 'text-[#777D85]')} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Help & Support */}
      <div className="p-4 border-t border-[#E8E4DC] space-y-2">
        <Link
          href="mailto:support@opportunitykit.com"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#777D85] hover:bg-[#F2ECE3] hover:text-[#20242B] transition-colors"
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-[#999DA3]" />
          <span>Help & Support</span>
        </Link>
        <p className="px-3 text-[10px] text-[#999DA3]">OpportunityKit v1.0.0</p>
      </div>
    </aside>
  );
}

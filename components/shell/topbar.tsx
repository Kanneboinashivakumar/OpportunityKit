'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/logo';
import {
  Search, Bell, LogOut, Menu, X, ChevronDown, User, Settings,
  Command, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/app', label: 'Dashboard' },
  { href: '/app/analyze', label: 'Analyze' },
  { href: '/app/opportunities', label: 'My Opportunities' },
  { href: '/app/profile', label: 'Profile' },
  { href: '/app/saved', label: 'Saved' },
  { href: '/app/notifications', label: 'Notifications' },
  { href: '/app/campus-tpo', label: 'Campus TPO' },
  { href: '/app/settings', label: 'Settings' },
];

export function Topbar({
  userEmail,
  userName = 'Student',
}: {
  userEmail?: string;
  userName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/app/opportunities?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Derive initial from name
  const displayName = userName && userName !== 'Student' ? userName : userEmail?.split('@')[0] || 'Shiva Kumar';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-[#E8E4DC] bg-[#FAF9F5]/90 backdrop-blur-md">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/app">
            <BrandLogo className="h-7 w-[150px]" />
          </Link>
        </div>

        {/* Desktop Search Bar (⌘K) matching Image 2, 3, 4, 5 */}
        <div className="hidden md:flex items-center flex-1 max-w-lg">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-[#999DA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunities, keywords, or organizations..."
              className="w-full pl-10 pr-12 py-2 text-xs bg-white border border-[#E8E4DC] rounded-xl text-[#20242B] placeholder:text-[#999DA3] focus:outline-none focus:ring-1 focus:ring-[#16233B] focus:border-[#16233B] transition-all shadow-2xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#E8E4DC] text-[10px] text-[#999DA3] font-mono">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </form>
        </div>

        {/* Right Side: Notifications Bell & User Profile */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications Button */}
          <Link href="/app/notifications" className="relative p-2 rounded-xl text-[#555B64] hover:bg-[#F2ECE3] hover:text-[#16233B] transition-colors" title="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#16A34A] ring-2 ring-white" />
          </Link>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#F2ECE3] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#16233B] text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-2xs">
                {initial}
              </div>
              <div className="hidden sm:block leading-tight pr-1">
                <p className="text-xs font-semibold text-[#16233B] max-w-[120px] truncate">{displayName}</p>
                <p className="text-[10px] text-[#777D85]">Student</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#999DA3] hidden sm:block" />
            </button>

            {/* User Dropdown Menu */}
            {userDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserDropdown(false)} />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#E8E4DC] shadow-lg py-1.5 z-50 text-xs text-[#20242B]">
                  <div className="px-3.5 py-2.5 border-b border-[#F0ECE4]">
                    <p className="font-semibold text-[#16233B] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#777D85] truncate">{userEmail || 'Student Account'}</p>
                  </div>

                  <Link
                    href="/app/profile"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#FAF9F5] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#777D85]" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/app/settings"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#FAF9F5] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#777D85]" />
                    <span>Settings</span>
                  </Link>

                  <div className="border-t border-[#F0ECE4] my-1" />

                  <button
                    onClick={() => {
                      setUserDropdown(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-[#DC2626] hover:bg-[#FEF2F2] transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-[#555B64] hover:bg-[#F2ECE3]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={() => setMenuOpen(false)}>
          <nav
            className="absolute top-16 left-0 right-0 bg-[#FAF9F5] border-b border-[#E8E4DC] p-4 space-y-1 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {mobileNavItems.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/app' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'block px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors',
                    isActive ? 'bg-[#E9F0EB] text-[#2D5542] font-semibold' : 'text-[#555B64] hover:bg-[#F2ECE3]'
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#E8E4DC]">
              <button
                onClick={signOut}
                className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

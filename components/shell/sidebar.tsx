'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand/logo';
import {
  LayoutDashboard,
  Search,
  BookOpen,
  User,
  Settings,
  Building2,
} from 'lucide-react';

const navItems = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/analyze', label: 'Analyze', icon: Search },
  { href: '/app/opportunities', label: 'Saved', icon: BookOpen },
  { href: '/app/profile', label: 'Profile', icon: User },
  { href: '/app/campus-tpo', label: 'Campus TPO', icon: Building2 },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-[var(--color-border)] bg-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--color-border)]">
        <Link href="/app" className="flex items-center gap-2">
          <BrandLogo className="w-[188px]" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/app' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-[var(--color-navy-50)] text-[var(--color-navy)] font-medium'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-subtle)]">OpportunityKit v0.1</p>
      </div>
    </aside>
  );
}

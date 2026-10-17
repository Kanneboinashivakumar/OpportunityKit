'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand/logo';

const navItems = [
  { href: '/app', label: 'Dashboard' },
  { href: '/app/analyze', label: 'Analyze' },
  { href: '/app/opportunities', label: 'Saved' },
  { href: '/app/profile', label: 'Profile' },
  { href: '/app/campus-tpo', label: 'Campus TPO' },
  { href: '/app/settings', label: 'Settings' },
];

export function Topbar({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  const signOut = async () => {
    await supabase?.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-sm">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/app" className="flex items-center gap-2">
            <BrandLogo className="h-8 w-[160px]" />
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {userEmail && (
            <span className="hidden sm:block text-xs text-[var(--color-text-subtle)] max-w-[160px] truncate">
              {userEmail}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" className="hidden md:flex">
            <LogOut className="w-4 h-4" />
          </Button>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-[var(--color-surface)]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMenuOpen(false)}>
          <nav
            className="absolute top-14 left-0 right-0 bg-white border-b border-[var(--color-border)] px-4 py-3 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href || (href !== '/app' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm',
                    isActive ? 'bg-[var(--color-navy-50)] text-[var(--color-navy)] font-medium' : 'text-[var(--color-text-muted)]'
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-md text-sm text-[var(--color-mismatch)]">
              Sign out
            </button>
          </nav>
        </div>
      )}
    </>
  );
}

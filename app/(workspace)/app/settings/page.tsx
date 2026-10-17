'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Shield, User, Info } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase?.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-navy)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Account
          </CardTitle>
          <CardDescription>Sign out of OpportunityKit on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={signOut} className="text-[var(--color-mismatch)] border-[var(--color-mismatch-border)] hover:bg-[var(--color-mismatch-bg)]">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" /> Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-[var(--color-text-muted)]">
            Your profile data, announcements, and audit results are stored privately in your Supabase account.
            Row Level Security (RLS) ensures only you can read your own data.
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Announcement text is sent to the configured LLM provider for extraction.
            Do not paste announcements containing personal data you do not wish to share.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" /> About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-text-muted)]">OpportunityKit v0.1.0 — self-hostable.</p>
          <p className="text-xs text-[var(--color-text-subtle)] mt-1">
            Eligibility engine version: 1.0.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

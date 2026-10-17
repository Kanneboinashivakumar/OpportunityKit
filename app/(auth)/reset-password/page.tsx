'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandLogo } from '@/components/brand/logo';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!supabase) {
      setError('Authentication is not configured yet. Add the Supabase URL and anon key, then restart the app.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) setError(updateError.message);
    else setSuccess(true);
  };

  return (
    <div className="auth-campus-page min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <BrandLogo />
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{success ? 'Password updated' : 'Choose a new password'}</CardTitle>
            <CardDescription>{success ? 'Your password has been changed.' : 'Use at least 8 characters for your new password.'}</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="w-10 h-10 text-[var(--color-match)] mx-auto" />
                <Link href="/login"><Button className="w-full">Return to sign in</Button></Link>
              </div>
            ) : (
              <>
              {!isSupabaseConfigured() && <p role="status" className="mb-4 rounded-md border border-[var(--color-missing-border)] bg-[var(--color-missing-bg)] px-3 py-2 text-sm text-[var(--color-text-muted)]">Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable password recovery.</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New password</Label>
                  <Input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                {error && <p role="alert" className="text-sm text-[var(--color-mismatch)] bg-[var(--color-mismatch-bg)] px-3 py-2 rounded-md">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />} Update password
                </Button>
              </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

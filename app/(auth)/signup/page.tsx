'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandLogo } from '@/components/brand/logo';
import { Loader2, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!supabase) {
      setError('Authentication is not configured yet. Add the Supabase URL and anon key, then restart the app.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="auth-campus-page min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-12 h-12 text-[var(--color-match)] mx-auto mb-4" />
            <h2 className="font-semibold text-lg text-[var(--color-navy)]">Check your email</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              We sent a confirmation link to <strong>{email}</strong>.<br />
              Click it to activate your account.
            </p>
            <Link href="/login" className="block mt-5">
              <Button variant="outline" className="w-full">Back to sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle>Create account</CardTitle>
            <CardDescription>Start analyzing opportunities for free.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSupabaseConfigured() && (
              <p role="status" className="mb-4 rounded-md border border-[var(--color-missing-border)] bg-[var(--color-missing-bg)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
                Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable account creation.
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password <span className="text-[var(--color-text-subtle)] font-normal">(min 8 chars)</span></Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--color-mismatch)] bg-[var(--color-mismatch-bg)] px-3 py-2 rounded-md">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create account
              </Button>
            </form>
            <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--color-navy)] hover:underline font-medium">Sign in</Link>
            </p>
            <p className="text-center text-xs text-[var(--color-text-subtle)] mt-3">
              By signing up you agree to our{' '}
              <Link href="/terms" className="hover:underline">Terms</Link>{' '}and{' '}
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

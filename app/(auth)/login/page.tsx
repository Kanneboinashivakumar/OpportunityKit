'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandLogo } from '@/components/brand/logo';
import {
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  Briefcase, CheckCircle2, Compass
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!supabase) {
        setError('Supabase credentials are not configured. Please check your environment variables.');
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    setOauthLoading(provider);
    try {
      if (!supabase) {
        setError('Supabase is not configured.');
        setOauthLoading(null);
        return;
      }
      const { error: oError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });
      if (oError) {
        setError(oError.message);
      }
    } catch {
      setError('OAuth sign in failed.');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center sm:text-left space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#16233B]">
          Sign in to OpportunityKit
        </h2>
        <p className="text-xs sm:text-sm text-[#555B64]">
          Access your opportunities, analyses, and action plans.
        </p>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuth('google')}
          disabled={!!oauthLoading || loading}
          className="w-full bg-white hover:bg-[#FAF9F5] border-[#E8E4DC] text-xs font-medium text-[#20242B] h-10 rounded-xl flex items-center justify-center gap-2"
        >
          {oauthLoading === 'google' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuth('github')}
          disabled={!!oauthLoading || loading}
          className="w-full bg-white hover:bg-[#FAF9F5] border-[#E8E4DC] text-xs font-medium text-[#20242B] h-10 rounded-xl flex items-center justify-center gap-2"
        >
          {oauthLoading === 'github' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          )}
          <span>GitHub</span>
        </Button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#E8E4DC] w-full" />
        <span className="bg-[#FAF9F5] px-3 text-[11px] font-medium uppercase tracking-wider text-[#999DA3] absolute">
          OR
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-[#20242B]">
            Email address
          </Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#999DA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="pl-10 h-11 bg-white border-[#E8E4DC] rounded-xl text-sm focus:border-[#16233B]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-[#20242B]">
              Password
            </Label>
            <Link href="/forgot-password" className="text-xs text-[#2D5542] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#999DA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="pl-10 pr-10 h-11 bg-white border-[#E8E4DC] rounded-xl text-sm focus:border-[#16233B]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#999DA3] hover:text-[#555B64] absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-start gap-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#16233B] hover:bg-[#20314F] text-white h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>Sign in</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <p className="text-center text-[11px] text-[#777D85] leading-relaxed pt-2">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-[#16233B]">Terms of Service</Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-[#16233B]">Privacy Policy</Link>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E8E4DC] bg-white">
        <Link href="/">
          <BrandLogo />
        </Link>
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="text-[#555B64] hidden sm:inline">New to OpportunityKit?</span>
          <Link href="/signup">
            <Button variant="outline" size="sm" className="border-[#16233B] text-[#16233B] hover:bg-[#FAF9F5] rounded-lg text-xs font-medium h-8">
              Create an account
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
          {/* Left Side: Campus Visual & Benefits (Image 1) */}
          <div className="hidden lg:block lg:col-span-7 relative rounded-3xl overflow-hidden min-h-[580px] p-8 lg:p-10 flex flex-col justify-between text-white border border-[#E8E4DC] shadow-sm">
            {/* Background Image */}
            <Image
              src="/images/campus-sunset.jpg"
              alt="Campus sunset walkway"
              fill
              priority
              className="object-cover object-center"
              sizes="50vw"
            />
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-[#16233B]/70 backdrop-blur-xs" />

            {/* Content Top */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-[#A7F3D0] border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                SMARTER OPPORTUNITIES FOR BRIGHTER FUTURES
              </div>
              <h1 className="font-serif text-3xl xl:text-4xl font-medium leading-tight text-white max-w-md">
                Welcome back to <br />OpportunityKit.
              </h1>
              <p className="text-xs xl:text-sm text-white/80 max-w-md leading-relaxed">
                Continue your journey to discover, analyze, and apply for the right opportunities with confidence.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="relative z-10 space-y-3.5 my-6">
              {[
                { icon: Briefcase, title: "Track Opportunities", desc: "Keep all your internships, scholarships, and competitions in one place." },
                { icon: CheckCircle2, title: "Check Your Eligibility", desc: "Get clear insights on what you match, what's missing, and how to improve." },
                { icon: Compass, title: "Take Action", desc: "Follow a personalized roadmap and never miss a deadline." },
              ].map((pill, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-white/15 text-[#A7F3D0] flex items-center justify-center shrink-0 mt-0.5">
                    <pill.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white">{pill.title}</h4>
                    <p className="text-[11px] text-white/75 leading-snug">{pill.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Testimonial */}
            <div className="relative z-10 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/40 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
                    alt="Aditi Sharma"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-xs italic text-white/95">
                    &ldquo;OpportunityKit helps me stay organized and confident about my future.&rdquo;
                  </p>
                  <p className="text-[11px] font-semibold text-[#A7F3D0] mt-0.5">
                    Aditi Sharma · B.Tech, IIIT Hyderabad
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Card Form */}
          <div className="lg:col-span-5 w-full bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E4DC] shadow-sm">
            <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#16233B]" /></div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-[#777D85]">
        &copy; {new Date().getFullYear()} OpportunityKit. All rights reserved.
      </footer>
    </div>
  );
}

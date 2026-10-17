import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BrandLogo } from '@/components/brand/logo';
import {
  Zap, CheckCircle2, XCircle, HelpCircle, ArrowRight,
  Shield, Clock, BookOpen, Users, ChevronDown,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/opportunitykit-campus.png"
          alt="Students walking toward a campus building at sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[rgba(250,247,242,0.94)] via-[rgba(250,247,242,0.82)] to-[rgba(250,247,242,0.52)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-6">
          No fabricated AI responses · No fake eligibility decisions
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-navy)] leading-tight text-balance mb-6">
          Turn an opportunity announcement<br className="hidden sm:block" />
          into an honest eligibility audit
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8 text-balance">
          Paste any internship, scholarship, competition, or hackathon announcement.
          AI extracts the requirements for your review. A deterministic engine compares them
          against your profile — no guessing, no fabrication.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/signup">
            <Button size="xl">
              Start for free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="xl" variant="outline">Sign in</Button>
          </Link>
        </div>
        <p className="text-xs text-[var(--color-text-subtle)] mt-4">
          Free to use · No credit card required · Your data stays yours
        </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-[var(--color-border)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[var(--color-navy)] text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Paste announcement',
                desc: 'Copy the full text of any internship, scholarship, competition, or hackathon posting.',
              },
              {
                step: '2',
                title: 'AI extracts requirements',
                desc: 'Gemini extracts eligibility criteria into a structured checklist. You review and correct every item.',
              },
              {
                step: '3',
                title: 'Deterministic audit',
                desc: 'A pure TypeScript engine compares requirements against your saved profile. No AI guessing on eligibility.',
              },
              {
                step: '4',
                title: 'Action plan',
                desc: 'Get a deadline-aware list of what to fix, fill, or accept — MATCH, MISMATCH, or MISSING INFO.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-navy-50)] text-[var(--color-navy)] font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-[var(--color-navy)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest Triage */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-3">Honest Triage — the core principle</h2>
          <p className="text-[var(--color-text-muted)]">
            Missing information is never treated as failure. The LLM extracts — it never decides eligibility.
            The engine is deterministic, explainable, and reproducible.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: CheckCircle2,
              label: 'MATCH',
              color: 'text-[var(--color-match)]',
              bg: 'bg-[var(--color-match-bg)] border-[var(--color-match-border)]',
              desc: 'Known, valid profile data satisfies the confirmed requirement.',
            },
            {
              icon: XCircle,
              label: 'MISMATCH',
              color: 'text-[var(--color-mismatch)]',
              bg: 'bg-[var(--color-mismatch-bg)] border-[var(--color-mismatch-border)]',
              desc: 'Known, valid profile data demonstrably fails the requirement.',
            },
            {
              icon: HelpCircle,
              label: 'MISSING INFO',
              color: 'text-[var(--color-missing)]',
              bg: 'bg-[var(--color-missing-bg)] border-[var(--color-missing-border)]',
              desc: 'Data is absent, ambiguous, or insufficient to decide. Never treated as a failure.',
            },
          ].map(({ icon: Icon, label, color, bg, desc }) => (
            <div key={label} className={`rounded-xl border p-6 ${bg}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className={`font-bold text-sm ${color}`}>{label}</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Opportunity types */}
      <section className="bg-white border-y border-[var(--color-border)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[var(--color-navy)] text-center mb-10">Supported opportunity types</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: '💼', label: 'Internships' },
              { icon: '🎓', label: 'Scholarships' },
              { icon: '🏆', label: 'Competitions' },
              { icon: '💡', label: 'Hackathons' },
            ].map(({ icon, label }) => (
              <div key={label} className="text-center p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="font-medium text-sm text-[var(--color-navy)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy / Trust */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--color-navy)] text-center mb-10">Privacy & trust</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Shield,
                title: 'Row Level Security',
                desc: 'Supabase RLS ensures only you can read your own profile, analyses, and results.',
              },
              {
                icon: Zap,
                title: 'Server-side LLM calls',
                desc: 'Your Gemini API key stays on the server. Announcement text is sent to Gemini only for automated extraction; provider terms vary by API tier.',
              },
              {
                icon: BookOpen,
                title: 'No fabricated data',
                desc: 'Dashboards and counts derive from your real persisted data. No fake metrics or invented success rates.',
              },
              {
                icon: Clock,
                title: 'Self-hostable',
                desc: 'Deploy with your own Vercel and Supabase projects, and keep workspace data in your database.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="pt-5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-[var(--color-navy-50)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--color-navy)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--color-navy)] mb-1">{title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Campus TPO teaser */}
      <section className="bg-[var(--color-navy)] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 mb-4">
            <Users className="w-4 h-4 text-white/70" />
            <Badge className="bg-white/10 text-white border-white/20 text-xs">Proposed institutional feature</Badge>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Campus TPO integration</h2>
          <p className="text-[rgba(255,255,255,0.7)] max-w-xl mx-auto mb-6 text-sm">
            Analyze cohort eligibility in bulk. Import a CSV of student profiles, run the same deterministic engine, and get aggregate breakdowns. Proposed at ₹25,000/year per institution — pricing not yet validated.
          </p>
          <Link href="/app/campus-tpo">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              View demo <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-[var(--color-navy)] text-center mb-10">Frequently asked questions</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            {
              q: 'Does the AI decide if I\'m eligible?',
              a: 'No. The LLM only extracts requirements from the announcement. A separate, deterministic TypeScript engine compares them against your profile. The engine never guesses.',
            },
            {
              q: 'What if a requirement is ambiguous?',
              a: 'Ambiguous requirements are flagged with needsReview=true and a low confidence score. You review them before any audit runs. Unresolvable requirements get a MANUAL_REVIEW status.',
            },
            {
              q: 'What if I don\'t have the Gemini API key?',
              a: 'The app shows a clear setup message and lets you enter requirements manually. No fake extraction results are ever shown.',
            },
            {
              q: 'Is my profile data private?',
              a: 'Yes. Supabase Row Level Security ensures your profile is only readable by you. Resume content is never stored in public URLs.',
            },
            {
              q: 'Can I use it without a dataset?',
              a: 'Absolutely. The workflow works entirely from pasted announcement text and your profile. No dataset needed.',
            },
          ].map(({ q, a }) => (
            <details key={q} className="group border border-[var(--color-border)] rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <span className="font-medium text-sm text-[var(--color-navy)]">{q}</span>
                <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-sm text-[var(--color-text-muted)] leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--color-border)] py-16 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-3">Ready to audit your next opportunity?</h2>
          <p className="text-[var(--color-text-muted)] mb-6">Free to get started. No credit card required.</p>
          <Link href="/signup">
            <Button size="xl">
              Create free account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-8 w-[160px]" />
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-subtle)]">
            <Link href="/privacy" className="hover:text-[var(--color-navy)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--color-navy)]">Terms</Link>
            <Link href="/app/campus-tpo" className="hover:text-[var(--color-navy)]">Campus TPO</Link>
          </div>
          <p className="text-xs text-[var(--color-text-subtle)]">
            © {new Date().getFullYear()} OpportunityKit.
          </p>
        </div>
      </footer>
    </div>
  );
}

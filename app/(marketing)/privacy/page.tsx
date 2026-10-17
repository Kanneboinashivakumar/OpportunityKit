import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-navy)] mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--color-text-subtle)] mb-8">Last updated: October 2026</p>

        <div className="prose-ok space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">What we collect</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              We collect your email address and password (stored securely via Supabase Auth).
              We also store the profile information you provide (including academic details, income where supplied, skills, documents listed by name, and links),
              opportunity announcements you paste, extracted requirements, and audit results.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">How we use it</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Your data is used solely to provide the OpportunityKit service — extracting requirements,
              running eligibility audits, and generating action plans. We do not sell your data.
              Supabase stores account and workspace data; Gemini processes announcement text for extraction.
              Gemini requests use <code>store: false</code> to disable saved interaction history.
              This setting does not override Google&apos;s abuse-monitoring, retention, or service terms. Under unpaid Gemini API services,
              Google may use submitted content to improve its products; paid services have different data-use terms. Review the current
              provider terms before sending sensitive information. Avoid pasting personal or confidential data into announcements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">Security</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Your data is protected by Supabase Row Level Security. Only you can read your own profile
              and analyses. API keys are never exposed to the browser. Passwords are not stored in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">Your rights</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              This prototype does not yet include an in-app account deletion control. A self-hosting operator can delete a user in the
              Supabase project, which cascades deletion of the associated profiles, opportunities, audit results, and action items.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">Contact</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Questions about this policy? Contact us via the GitHub repository.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /> Back to home</Button></Link>
        </div>
      </div>
    </div>
  );
}

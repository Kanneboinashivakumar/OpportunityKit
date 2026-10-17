import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-navy)] mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="text-3xl font-bold text-[var(--color-navy)] mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--color-text-subtle)] mb-8">Last updated: October 2026</p>

        <div className="prose-ok space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">Acceptance</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              By using OpportunityKit you agree to these terms. If you disagree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">No eligibility guarantee</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              OpportunityKit provides an informational analysis tool only. Audit results (MATCH, MISMATCH,
              MISSING INFO) are based on the information you provide in your profile and the requirements
              extracted from announcement text. We make no guarantee about actual eligibility for any
              opportunity. Always verify eligibility directly with the opportunity issuer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">User responsibilities</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              You are responsible for the accuracy of your profile information. Do not paste announcements
              containing instructions intended to manipulate the AI (prompt injection). Do not use the
              service to process personal data of others without their consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">Intellectual property</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              OpportunityKit source code is open source. Extracted requirement data and audit results
              generated from your inputs belong to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-navy)] mb-2">Limitation of liability</h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              The service is provided &ldquo;as is&rdquo;. We are not liable for decisions made based on
              audit results, missed opportunities, or any damages arising from use of the service.
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

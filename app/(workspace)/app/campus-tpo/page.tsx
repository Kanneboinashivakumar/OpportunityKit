import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Info, Download, Upload } from 'lucide-react';

export const metadata = { title: 'Campus TPO' };

export default function CampusTPOPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-navy-50)] flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-[var(--color-navy)]" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-semibold text-[var(--color-navy)]">Campus TPO</h1>
            <Badge variant="missing">Demo / Proposed</Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            Institutional concept — not a live service. Numbers and pricing below are illustrative.
          </p>
        </div>
      </div>

      {/* Honest disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--color-missing-border)] bg-[var(--color-missing-bg)]">
        <Info className="w-4 h-4 text-[var(--color-missing)] shrink-0 mt-0.5" />
        <p className="text-sm text-[var(--color-text-muted)]">
          <strong>This is a concept / proposal page.</strong> No real students have been analyzed.
          No institutional contracts exist. The proposed pricing is not validated.
          This view demonstrates what a TPO integration could look like if implemented.
        </p>
      </div>

      {/* Proposed value proposition */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Proposed price', value: '₹25,000/year', note: 'Per institution — unvalidated' },
          { label: 'Students supported', value: 'Unlimited', note: 'Within fair-use limits' },
          { label: 'Deployment', value: 'Cloud / On-prem', note: 'On request' },
        ].map(({ label, value, note }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-5">
              <p className="text-xl font-bold text-[var(--color-navy)]">{value}</p>
              <p className="text-xs font-medium text-[var(--color-text)] mt-0.5">{label}</p>
              <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What it would do */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Proposed features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            {[
              'Upload a CSV of student profiles with validated column mapping',
              'Run the same deterministic eligibility engine against every student',
              'Aggregate MATCH / MISMATCH / MISSING INFO counts per opportunity',
              'Downloadable results with privacy protections (no raw resume content)',
              'Dashboard view of cohort readiness across multiple opportunities',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-[var(--color-sage)] mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* CSV format */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Expected CSV format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            The import would accept a CSV with the following columns (all optional except name):
          </p>
          <pre className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-3 text-xs font-mono overflow-x-auto text-[var(--color-text-muted)]">
{`name,degree,branch,academic_year,cgpa,cgpa_scale,skills,github_url,portfolio_url,availability_weeks
"Priya Sharma","B.Tech","CS","3rd",8.5,10,"Python,React","https://github.com/priya","",8`}
          </pre>
          <div className="flex gap-2">
            <a
              href="/sample-tpo-template.csv"
              download
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-navy)] hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> Download template
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-[var(--color-navy)] text-sm">Interested in a pilot?</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Contact us to discuss a free institutional trial.
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Upload className="w-4 h-4" /> Request pilot (not live)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

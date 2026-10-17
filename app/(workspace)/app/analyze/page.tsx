'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2, Upload, AlertCircle, Info, Wand2
} from 'lucide-react';

const MAX_CHARS = 30000;

export default function AnalyzePage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('auto');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [error, setError] = useState<{ message: string; canManuallyEnter?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 50) {
      setError({ message: 'Paste at least 50 characters of the announcement.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text.trim(), source_url: sourceUrl.trim() || undefined, title: title.trim() || undefined, type: type === 'auto' ? undefined : type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({
          message: data.message ?? data.error ?? 'Extraction failed.',
          canManuallyEnter: data.canManuallyEnter,
        });
        return;
      }
      // Navigate to review page
      router.push(`/app/analyze/${data.opportunity.id}/review`);
    } catch {
      setError({ message: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualReview = async () => {
    if (text.trim().length < 50) {
      setError({ message: 'Paste at least 50 characters of the announcement before continuing manually.' });
      return;
    }
    setManualSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text.trim(), title: title.trim() || undefined, type: type === 'auto' ? undefined : type, source_url: sourceUrl.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? 'Could not save this opportunity.');
      router.push(`/app/analyze/${data.opportunity.id}/review`);
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : 'Could not save this opportunity.' });
    } finally {
      setManualSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;
    setError(null);
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
      setError({ message: `File exceeds ${maxMB} MB limit.` });
      return;
    }
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isText = file.type.startsWith('text/') || /\.(txt|md|text)$/i.test(file.name);
    if (!isText && !isPdf) {
      setError({ message: 'Upload a plain text (.txt, .md) or PDF file.' });
      return;
    }
    setUploading(true);
    try {
      let content: string;
      if (isPdf) {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
        const pdf = await pdfjs.getDocument({
          data: new Uint8Array(await file.arrayBuffer()),
          isEvalSupported: false,
        }).promise;
        if (pdf.numPages > 50) {
          setError({ message: 'PDFs are limited to 50 pages. Upload a shorter document.' });
          return;
        }
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();
          pages.push(textContent.items.map((item) => 'str' in item ? item.str : '').join(' '));
        }
        content = pages.join('\n\n');
        if (!content.trim()) {
          setError({ message: 'This PDF has no selectable text. Copy and paste its text, or use an OCR tool first.' });
          return;
        }
      } else {
        content = await file.text();
      }
      setText(content.slice(0, MAX_CHARS));
    } catch {
      setError({ message: 'Could not read this file. Check that it is a valid text or PDF document.' });
    } finally {
      setUploading(false);
    }
  };

  const charCount = text.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-navy)]">Analyze Opportunity</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Paste an internship, scholarship, competition, or hackathon announcement. The AI will extract requirements for your review.
        </p>
      </div>

      {/* How it works */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Info className="w-4 h-4 text-[var(--color-navy)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-text-muted)]">
          The AI extracts requirements from the announcement. You review and confirm them before any eligibility check runs.
          The eligibility engine is deterministic — no guessing, no fabrication.
          Missing profile information is flagged as <strong>MISSING INFO</strong>, not as a failure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Opportunity details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="opportunity_title">Title <span className="font-normal text-[var(--color-text-subtle)]">(optional)</span></Label>
              <Input id="opportunity_title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="e.g. Summer research internship" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="opportunity_type">Opportunity type</Label>
              <select id="opportunity_type" value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm">
                <option value="auto">Let extraction suggest</option>
                {['internship', 'scholarship', 'competition', 'hackathon', 'other'].map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Announcement text</CardTitle>
            <CardDescription>
              Paste the full announcement. The more complete, the better the extraction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the full internship / scholarship / competition announcement here…"
              className="min-h-[280px] font-mono text-xs leading-relaxed"
              maxLength={MAX_CHARS}
              required
              minLength={50}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <Upload className="w-4 h-4" />
                {uploading ? 'Reading file…' : 'Upload text or PDF'}
                <input
                  type="file"
                  accept=".txt,.md,.text,.pdf,application/pdf,text/plain,text/markdown"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              <span className={`text-xs tabular-nums ${nearLimit ? 'text-[var(--color-missing)]' : 'text-[var(--color-text-subtle)]'}`}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Source URL <span className="font-normal text-[var(--color-text-subtle)]">(optional)</span></CardTitle>
            <CardDescription>
              Official page for reference. Not fetched automatically — paste text above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1.5">
              <Label htmlFor="source_url">Source URL</Label>
              <Input
                id="source_url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/internship-2025"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-mismatch-bg)] border border-[var(--color-mismatch-border)]">
            <AlertCircle className="w-4 h-4 text-[var(--color-mismatch)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--color-mismatch)]">{error.message}</p>
              {error.canManuallyEnter && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  You can configure the Gemini API key in <code className="bg-[var(--color-surface)] px-1 rounded">.env.local</code> to enable AI extraction.
                </p>
              )}
            </div>
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading || text.trim().length < 50}>
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Extracting requirements…</>
          ) : (
            <><Wand2 className="w-4 h-4" /> Extract & review requirements</>
          )}
        </Button>
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-2">Prefer to add requirements yourself, or continue while extraction is unavailable?</p>
          <Button type="button" variant="outline" onClick={handleManualReview} disabled={manualSaving || text.trim().length < 50}>
            {manualSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Continue with manual review
          </Button>
        </div>
      </form>
    </div>
  );
}

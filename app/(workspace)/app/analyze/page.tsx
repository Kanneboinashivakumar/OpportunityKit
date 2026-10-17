'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Upload,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const MAX_CHARS = 30000;

interface RecentOpportunity {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentOpportunity[]>([]);
  const [error, setError] = useState<{ message: string; canManuallyEnter?: boolean } | null>(null);
  const [urlSuccess, setUrlSuccess] = useState<string | null>(null);

  // Load recent opportunities from database
  useEffect(() => {
    let cancelled = false;
    fetch('/api/opportunities?limit=5')
      .then((res) => (res.ok ? res.json() : { opportunities: [] }))
      .then((data) => {
        if (!cancelled && data.opportunities) {
          setRecentAnalyses(data.opportunities);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Step 1: Scrape URL content with SSRF protection
  const handleAnalyzeUrl = async () => {
    if (!urlInput.trim()) {
      setError({ message: 'Please enter a valid opportunity link to analyze.' });
      return;
    }
    setScrapingUrl(true);
    setError(null);
    setUrlSuccess(null);

    try {
      const res = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError({
          message: data.message || 'Could not fetch content from this link.',
          canManuallyEnter: true,
        });
        return;
      }

      // Populate form with fetched data
      setText(data.text);
      if (data.title && !title) setTitle(data.title.slice(0, 150));
      setUrlSuccess(`Successfully retrieved ${data.charCount} characters from ${new URL(data.url).hostname}. You can review or analyze now.`);
    } catch {
      setError({
        message: 'Network error while accessing the link. You can paste the announcement text directly.',
        canManuallyEnter: true,
      });
    } finally {
      setScrapingUrl(false);
    }
  };

  // Submit for AI Extraction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contentToAnalyze = text.trim();

    if (contentToAnalyze.length < 50) {
      setError({ message: 'Please paste at least 50 characters of announcement details or fetch from a link.' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: contentToAnalyze,
          source_url: urlInput.trim() || undefined,
          title: title.trim() || undefined,
          type: category || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({
          message: data.message ?? data.error ?? 'Extraction failed.',
          canManuallyEnter: data.canManuallyEnter,
        });
        return;
      }
      router.push(`/app/analyze/${data.opportunity.id}/review`);
    } catch {
      setError({ message: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Manual fallback when LLM is not configured
  const handleManualReview = async () => {
    const contentToAnalyze = text.trim();
    if (contentToAnalyze.length < 50) {
      setError({ message: 'Paste at least 50 characters of the announcement before continuing manually.' });
      return;
    }
    setManualSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: contentToAnalyze,
          title: title.trim() || 'Untitled Opportunity',
          type: category || 'other',
          source_url: urlInput.trim() || undefined,
        }),
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

  // File upload handler (TXT, MD, PDF)
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
      let content = '';
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
          pages.push(textContent.items.map((item) => ('str' in item ? item.str : '')).join(' '));
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
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    } catch {
      setError({ message: 'Could not read this file. Check that it is a valid text or PDF document.' });
    } finally {
      setUploading(false);
    }
  };

  const charCount = text.length;

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#16233B] tracking-tight">
          Analyze an Opportunity
        </h1>
        <p className="text-sm text-[#555B64] mt-1.5 font-normal">
          See if you&apos;re eligible, what&apos;s missing, and get a personalized action plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Paste Opportunity Link */}
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#16233B]">Paste Opportunity Link</h2>
              <p className="text-xs text-[#777D85] mt-0.5">
                Enter the official link of the internship, scholarship, or competition.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999DA3]" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/opportunity"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E4DC] text-sm text-[#16233B] placeholder:text-[#999DA3] focus:outline-none focus:ring-1 focus:ring-[#2D5542] focus:border-[#2D5542] bg-[#FAF9F5]/40"
              />
            </div>
            <Button
              type="button"
              onClick={handleAnalyzeUrl}
              disabled={scrapingUrl || !urlInput.trim()}
              className="bg-[#16233B] hover:bg-[#20304C] text-white px-5 py-2.5 rounded-xl h-auto font-medium text-xs sm:text-sm shrink-0 flex items-center gap-2"
            >
              {scrapingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  Fetch & Populate
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>

          <p className="text-[11px] text-[#777D85] flex items-center gap-1.5 pt-0.5">
            <Globe className="w-3.5 h-3.5 text-[#2D5542]" />
            We&apos;ll automatically extract all important details from the public page with SSRF protection.
          </p>

          {urlSuccess && (
            <div className="p-3 rounded-xl bg-[#E9F0EB] text-[#2D5542] text-xs flex items-center gap-2 border border-[#C6DEC9]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{urlSuccess}</span>
            </div>
          )}
        </div>

        {/* OR Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#E8E4DC] w-full" />
          <span className="bg-[#FAF9F5] px-4 text-xs font-semibold text-[#999DA3] uppercase tracking-wider absolute">
            OR
          </span>
        </div>

        {/* Step 2: Describe Manually */}
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-3.5">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#16233B]">Describe Manually</h2>
                <p className="text-xs text-[#777D85] mt-0.5">
                  You can also provide details directly or upload a document.
                </p>
              </div>
            </div>

            {/* Upload document trigger */}
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E4DC] hover:bg-[#FAF9F5] text-xs font-medium text-[#555B64] cursor-pointer transition-colors shrink-0">
              <Upload className="w-3.5 h-3.5 text-[#2D5542]" />
              <span>{uploading ? 'Parsing...' : 'Upload PDF / Text'}</span>
              <input
                type="file"
                accept=".txt,.md,.text,.pdf,application/pdf"
                className="sr-only"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the description or key details here... e.g. eligibility criteria, CGPA requirement, branch eligibility, required skills, and deadlines."
                className="min-h-[160px] rounded-xl border-[#E8E4DC] text-sm text-[#16233B] placeholder:text-[#999DA3] bg-[#FAF9F5]/30 focus:border-[#2D5542] focus:ring-[#2D5542] p-4 font-sans leading-relaxed"
                maxLength={MAX_CHARS}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#999DA3] px-1">
              <span>Min. 50 characters for structured extraction</span>
              <span className={charCount > 28000 ? 'text-[#D97706]' : ''}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Select Category (Optional) */}
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#16233B]">Select Category (Optional)</h2>
              <p className="text-xs text-[#777D85] mt-0.5">
                Helps us give better recommendations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="category_select" className="text-xs font-medium text-[#555B64]">
                Category
              </Label>
              <select
                id="category_select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#E8E4DC] bg-white px-3.5 py-2.5 text-sm text-[#16233B] focus:outline-none focus:ring-1 focus:ring-[#2D5542] focus:border-[#2D5542]"
              >
                <option value="">Let extraction suggest automatically</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="competition">Competition</option>
                <option value="hackathon">Hackathon</option>
                <option value="other">Research / Fellowship / Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title_input" className="text-xs font-medium text-[#555B64]">
                Opportunity Title (Optional)
              </Label>
              <Input
                id="title_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Google Summer Internship 2025"
                className="rounded-xl border-[#E8E4DC] text-sm text-[#16233B] placeholder:text-[#999DA3]"
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FEE2E2]/60 border border-[#FECACA] text-[#DC2626]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-sm">{error.message}</p>
              {error.canManuallyEnter && (
                <p className="mt-1 text-[#555B64]">
                  AI extraction requires a configured Gemini API key, or you can proceed with manual review below.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading || text.trim().length < 50}
            className="w-full sm:w-auto bg-[#16233B] hover:bg-[#20304C] text-white px-8 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 h-auto shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting Requirements with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#C6DEC9]" />
                Extract & Review Requirements
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleManualReview}
            disabled={manualSaving || text.trim().length < 50}
            className="w-full sm:w-auto rounded-xl border-[#E8E4DC] hover:bg-[#FAF9F5] text-[#555B64] text-xs font-medium py-3 h-auto"
          >
            {manualSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Continue with manual review
          </Button>
        </div>
      </form>

      {/* Recent Analyses Section (Image 4 Left) */}
      <div className="pt-6 border-t border-[#E8E4DC] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-semibold text-[#16233B]">Recent Analyses</h2>
          <Link
            href="/app/opportunities"
            className="text-xs font-medium text-[#2D5542] hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8E4DC] p-8 text-center text-xs text-[#777D85]">
            No opportunities analyzed yet. Paste a link or text above to run your first analysis.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentAnalyses.map((opp) => (
              <div
                key={opp.id}
                className="flex items-center justify-between p-4 rounded-xl border border-[#E8E4DC] bg-white hover:border-[#D5CFBF] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#555B64]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#16233B] truncate">{opp.title}</p>
                    <p className="text-xs text-[#777D85] mt-0.5">
                      Analyzed {formatDate(opp.created_at)} · <span className="capitalize">{opp.type}</span>
                    </p>
                  </div>
                </div>

                <Link href={`/app/opportunities/${opp.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-[#E8E4DC] text-xs font-medium text-[#16233B] hover:bg-[#FAF9F5] flex items-center gap-1.5 shrink-0"
                  >
                    <span>View Result</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

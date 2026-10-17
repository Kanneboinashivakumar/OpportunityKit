'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { CompanyLogo } from '@/components/opportunities/company-logo';
import {
  Bookmark,
  ArrowRight,
  Plus,
  Inbox,
  Search,
} from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  type: string;
  status: string;
  deadline?: string;
  created_at: string;
  source_url?: string;
}

export default function SavedOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [oppRes, profRes] = await Promise.all([
          fetch('/api/opportunities?limit=100'),
          fetch('/api/profile'),
        ]);

        let allOpps: Opportunity[] = [];
        let bookmarked: string[] = [];

        if (oppRes.ok) {
          const oppData = await oppRes.json();
          allOpps = oppData.opportunities ?? [];
        }

        if (profRes.ok) {
          const profData = await profRes.json();
          const prefs = profData.profile?.preferences || {};
          if (Array.isArray(prefs.saved_opportunity_ids)) {
            bookmarked = prefs.saved_opportunity_ids;
          }
        }

        if (!cancelled) {
          setOpportunities(allOpps);
          setSavedIds(bookmarked);
        }
      } catch (e) {
        console.error('Failed to load saved opportunities:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUnsave = async (id: string) => {
    const newSaved = savedIds.filter((item) => item !== id);
    setSavedIds(newSaved);

    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: { saved_opportunity_ids: newSaved },
        }),
      });
    } catch {
      setSavedIds(savedIds);
    }
  };

  const savedOpportunities = opportunities.filter((o) => savedIds.includes(o.id));
  const filtered = savedOpportunities.filter((o) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return o.title.toLowerCase().includes(s) || o.type.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#16233B] tracking-tight">
            Saved Opportunities
          </h1>
          <p className="text-sm text-[#555B64] mt-1 font-normal">
            Keep track of bookmarks, application requirements, and upcoming deadlines.
          </p>
        </div>

        {savedOpportunities.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999DA3]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter saved opportunities..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E8E4DC] bg-white text-xs sm:text-sm text-[#16233B] placeholder:text-[#999DA3] focus:outline-none focus:ring-1 focus:ring-[#2D5542] shadow-2xs"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E8E4DC] p-16 text-center space-y-3 bg-white">
          <Bookmark className="w-10 h-10 text-[#999DA3] mx-auto stroke-1" />
          <h3 className="text-base font-semibold text-[#16233B]">
            {search ? 'No matching saved opportunities' : 'No saved opportunities yet'}
          </h3>
          <p className="text-xs text-[#777D85] max-w-sm mx-auto">
            {search
              ? 'Try searching with a different keyword.'
              : 'Bookmark opportunities from your analyses or the opportunities catalog to review them here.'}
          </p>
          <Link href="/app/opportunities" className="inline-block pt-2">
            <Button size="sm" className="bg-[#16233B] text-white rounded-xl gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Explore My Opportunities
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="rounded-2xl border border-[#E8E4DC] bg-white p-4 sm:p-5 hover:border-[#D5CFBF] transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <CompanyLogo title={opp.title} />
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    href={`/app/opportunities/${opp.id}`}
                    className="text-sm sm:text-base font-semibold text-[#16233B] hover:text-[#2D5542] transition-colors leading-snug line-clamp-1"
                  >
                    {opp.title}
                  </Link>
                  <p className="text-xs text-[#777D85] capitalize">{opp.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-[#999DA3]">
                    Deadline
                  </p>
                  <p className="text-xs font-semibold text-[#16233B]">
                    {opp.deadline ? formatDate(opp.deadline) : 'Ongoing'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUnsave(opp.id)}
                    className="w-9 h-9 rounded-xl border border-[#FDE68A] bg-[#FEF3C7] text-[#B45309] flex items-center justify-center transition-colors"
                    title="Remove from saved"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  <Link href={`/app/opportunities/${opp.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-[#E8E4DC] text-xs font-medium text-[#16233B] hover:bg-[#FAF9F5] h-9 px-3.5 flex items-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

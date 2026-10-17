'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, daysUntil, urgencyLabel, truncate } from '@/lib/utils';
import { Search, Plus, ExternalLink, Inbox } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  type: string;
  status: string;
  deadline?: string;
  created_at: string;
  source_url?: string;
}

const TYPE_FILTERS = ['All', 'internship', 'scholarship', 'competition', 'hackathon', 'other'];
const STATUS_FILTERS = ['All', 'review', 'audited', 'draft', 'archived'];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetch('/api/opportunities')
      .then((r) => r.json())
      .then((d) => setOpportunities(d.opportunities ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = opportunities.filter((o) => {
    const matchSearch = !search ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.type.includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || o.type === typeFilter;
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-navy)]">Saved Opportunities</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {loading ? '…' : `${opportunities.length} total`}
          </p>
        </div>
        <Link href="/app/analyze">
          <Button size="sm">
            <Plus className="w-4 h-4" /> New analysis
          </Button>
        </Link>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-subtle)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-navy)] bg-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                typeFilter === t
                  ? 'bg-[var(--color-navy)] text-white border-[var(--color-navy)]'
                  : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-navy)]'
              }`}
            >
              {t}
            </button>
          ))}
          <span className="text-[var(--color-border)]">|</span>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                statusFilter === s
                  ? 'bg-[var(--color-navy)] text-white border-[var(--color-navy)]'
                  : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-navy)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Inbox className="w-10 h-10 text-[var(--color-border)] mx-auto mb-3" />
          <p className="text-sm text-[var(--color-text-muted)]">
            {search || typeFilter !== 'All' || statusFilter !== 'All'
              ? 'No matches for the current filters.'
              : 'No saved opportunities yet.'}
          </p>
          {!search && typeFilter === 'All' && statusFilter === 'All' && (
            <Link href="/app/analyze">
              <Button size="sm" className="mt-3">
                <Plus className="w-4 h-4" /> Analyze your first opportunity
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((opp) => {
            const days = daysUntil(opp.deadline);
            return (
              <Card key={opp.id} className="hover:border-[var(--color-navy)] transition-colors">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/app/opportunities/${opp.id}`}
                      className="text-sm font-medium text-[var(--color-navy)] hover:underline"
                    >
                      {truncate(opp.title, 80)}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-[var(--color-text-subtle)] capitalize">{opp.type}</span>
                      <span className="text-xs text-[var(--color-text-subtle)]">{formatDate(opp.created_at)}</span>
                      {opp.source_url && (
                        <a
                          href={opp.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--color-navy)] hover:underline flex items-center gap-0.5"
                        >
                          Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {opp.deadline && (
                      <Badge
                        variant={
                          days !== null && days < 0 ? 'secondary' :
                          days !== null && days <= 7 ? 'mismatch' :
                          days !== null && days <= 30 ? 'missing' : 'secondary'
                        }
                      >
                        {urgencyLabel(days)}
                      </Badge>
                    )}
                    <Badge variant={opp.status === 'audited' ? 'match' : 'secondary'} className="capitalize">
                      {opp.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

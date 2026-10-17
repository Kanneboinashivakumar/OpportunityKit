'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { CompanyLogo } from '@/components/opportunities/company-logo';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  ArrowRight,
  MoreVertical,
  Plus,
  Inbox,
  Check,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
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

const TABS = ['All', 'Analyzed', 'Eligible', 'In Progress', 'Saved', 'Applied'] as const;
type TabType = (typeof TABS)[number];

const PAGE_SIZE = 8;

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Load opportunities and saved IDs
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [oppRes, profRes] = await Promise.all([
          fetch('/api/opportunities?limit=100'),
          fetch('/api/profile'),
        ]);

        if (oppRes.ok) {
          const oppData = await oppRes.json();
          if (!cancelled) setOpportunities(oppData.opportunities ?? []);
        }

        if (profRes.ok) {
          const profData = await profRes.json();
          const prefs = profData.profile?.preferences || {};
          if (!cancelled && Array.isArray(prefs.saved_opportunity_ids)) {
            setSavedIds(prefs.saved_opportunity_ids);
          }
        }
      } catch (e) {
        console.error('Failed to load opportunities:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Toggle bookmark / saved
  const toggleSave = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlySaved = savedIds.includes(id);
    const newSaved = isCurrentlySaved ? savedIds.filter((item) => item !== id) : [...savedIds, id];
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
      // Rollback on failure
      setSavedIds(savedIds);
    }
  };

  // Delete opportunity
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      const res = await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
        setSavedIds((prev) => prev.filter((s) => s !== id));
      }
    } catch (e) {
      console.error('Failed to delete:', e);
    }
  };

  // Filter opportunities
  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      // Search match
      const s = search.toLowerCase().trim();
      const matchSearch =
        !s ||
        opp.title.toLowerCase().includes(s) ||
        opp.type.toLowerCase().includes(s);

      // Type filter
      const matchType = typeFilter === 'all' || opp.type.toLowerCase() === typeFilter.toLowerCase();

      // Tab match
      let matchTab = true;
      if (activeTab === 'Analyzed') {
        matchTab = opp.status === 'audited' || opp.status === 'review';
      } else if (activeTab === 'Eligible') {
        matchTab = opp.status === 'audited';
      } else if (activeTab === 'In Progress') {
        matchTab = opp.status === 'in_progress' || opp.status === 'review';
      } else if (activeTab === 'Saved') {
        matchTab = savedIds.includes(opp.id) || opp.status === 'saved';
      } else if (activeTab === 'Applied') {
        matchTab = opp.status === 'applied';
      }

      return matchSearch && matchType && matchTab;
    });
  }, [opportunities, search, typeFilter, activeTab, savedIds]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const startIndex = filtered.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filtered.length);

  // Helper for status badge styling
  const renderStatusBadge = (opp: Opportunity) => {
    const isSaved = savedIds.includes(opp.id);
    let label = opp.status;
    let className = 'bg-[#FAF9F5] text-[#555B64] border-[#E8E4DC]';

    if (opp.status === 'audited') {
      label = 'Analyzed';
      className = 'bg-[#E9F0EB] text-[#2D5542] border-[#C6DEC9]';
    } else if (opp.status === 'in_progress' || opp.status === 'review') {
      label = 'In Progress';
      className = 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
    } else if (opp.status === 'applied') {
      label = 'Applied';
      className = 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]';
    } else if (isSaved) {
      label = 'Saved';
      className = 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
    }

    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${className} capitalize`}>
        {label}
      </span>
    );
  };

  // Derive organization / secondary label from title
  const getOrgName = (title: string, type: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('google')) return 'Google';
    if (lower.includes('microsoft')) return 'Microsoft';
    if (lower.includes('adobe')) return 'Adobe';
    if (lower.includes('isro')) return 'ISRO';
    if (lower.includes('iit')) return 'IIT Bombay';
    if (lower.includes('nvidia')) return 'NVIDIA';
    if (lower.includes('reliance')) return 'Reliance Foundation';
    if (lower.includes('infosys')) return 'Infosys';
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Organization';
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16" onClick={() => setMenuOpenId(null)}>
      {/* Top Header & Search Bar (Image 4 Right) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#16233B] tracking-tight">
            My Opportunities
          </h1>
          <p className="text-sm text-[#555B64] mt-1 font-normal">
            All your analyzed, saved, and applied opportunities in one place.
          </p>
        </div>

        {/* Right Search & Filter Control */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999DA3]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search your opportunities..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E8E4DC] bg-white text-xs sm:text-sm text-[#16233B] placeholder:text-[#999DA3] focus:outline-none focus:ring-1 focus:ring-[#2D5542] shadow-2xs"
            />
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFilterMenuOpen(!filterMenuOpen);
              }}
              className="px-3.5 py-2 rounded-xl border border-[#E8E4DC] bg-white hover:bg-[#FAF9F5] text-xs font-medium text-[#555B64] flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#555B64]" />
              <span>Filter</span>
            </button>

            {filterMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border border-[#E8E4DC] bg-white shadow-lg p-2 z-20 space-y-1"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="px-2 py-1 text-[10px] font-semibold text-[#999DA3] uppercase tracking-wider">
                  Opportunity Type
                </p>
                {['all', 'internship', 'scholarship', 'competition', 'hackathon', 'other'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTypeFilter(t);
                      setFilterMenuOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      typeFilter === t
                        ? 'bg-[#E9F0EB] text-[#2D5542] font-semibold'
                        : 'text-[#555B64] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <span className="capitalize">{t}</span>
                    {typeFilter === t && <Check className="w-3.5 h-3.5 text-[#2D5542]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs (Image 4 Right) */}
      <div className="border-b border-[#E8E4DC] flex items-center gap-6 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                isActive
                  ? 'text-[#2D5542] font-semibold'
                  : 'text-[#777D85] hover:text-[#16233B]'
              }`}
            >
              {tab}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5542] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Opportunities List Cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E8E4DC] p-16 text-center space-y-3 bg-white">
          <Inbox className="w-10 h-10 text-[#999DA3] mx-auto stroke-1" />
          <h3 className="text-base font-semibold text-[#16233B]">
            {search || typeFilter !== 'all' || activeTab !== 'All'
              ? 'No matching opportunities found'
              : 'No opportunities yet'}
          </h3>
          <p className="text-xs text-[#777D85] max-w-sm mx-auto">
            {search || typeFilter !== 'all' || activeTab !== 'All'
              ? 'Try adjusting your search terms or active filters.'
              : 'Analyze an announcement link or paste text to audit your eligibility.'}
          </p>
          <Link href="/app/analyze" className="inline-block pt-2">
            <Button size="sm" className="bg-[#16233B] text-white rounded-xl gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Analyze New Opportunity
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((opp) => {
            const isSaved = savedIds.includes(opp.id);
            const org = getOrgName(opp.title, opp.type);

            return (
              <div
                key={opp.id}
                className="rounded-2xl border border-[#E8E4DC] bg-white p-4 sm:p-5 hover:border-[#D5CFBF] transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Logo & Details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <CompanyLogo title={opp.title} />

                  <div className="min-w-0 flex-1 space-y-1">
                    <Link
                      href={`/app/opportunities/${opp.id}`}
                      className="text-sm sm:text-base font-semibold text-[#16233B] hover:text-[#2D5542] transition-colors leading-snug line-clamp-1"
                    >
                      {opp.title}
                    </Link>

                    <p className="text-xs text-[#777D85]">{org}</p>

                    <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E8E4DC] text-[11px] font-medium text-[#555B64] capitalize">
                        {opp.type}
                      </span>
                      {opp.source_url && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E8E4DC] text-[11px] text-[#777D85]">
                          Public Link
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Deadline & Status */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 sm:gap-1.5 shrink-0 px-1 sm:px-4">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-[#999DA3]">
                      Deadline
                    </p>
                    <p className="text-xs font-semibold text-[#16233B]">
                      {opp.deadline ? formatDate(opp.deadline) : 'Ongoing'}
                    </p>
                  </div>
                  <div>{renderStatusBadge(opp)}</div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => toggleSave(opp.id, e)}
                    className={`w-9 h-9 rounded-xl border border-[#E8E4DC] flex items-center justify-center transition-colors ${
                      isSaved
                        ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                        : 'text-[#999DA3] hover:text-[#16233B] hover:bg-[#FAF9F5]'
                    }`}
                    title={isSaved ? 'Remove from saved' : 'Save opportunity'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  {/* View Details Button */}
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

                  {/* 3-dots Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === opp.id ? null : opp.id);
                      }}
                      className="w-9 h-9 rounded-xl hover:bg-[#FAF9F5] text-[#999DA3] hover:text-[#16233B] flex items-center justify-center transition-colors"
                      title="More actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpenId === opp.id && (
                      <div
                        className="absolute right-0 mt-2 w-44 rounded-xl border border-[#E8E4DC] bg-white shadow-lg p-1.5 z-20 space-y-0.5 text-xs text-[#555B64]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/app/opportunities/${opp.id}`}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9F5] hover:text-[#16233B]"
                        >
                          View Eligibility Audit
                        </Link>
                        <Link
                          href={`/app/analyze/${opp.id}/review`}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9F5] hover:text-[#16233B]"
                        >
                          Edit Requirements
                        </Link>
                        {opp.source_url && (
                          <a
                            href={opp.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9F5] hover:text-[#16233B]"
                          >
                            <span>Open Source</span>
                            <ExternalLink className="w-3 h-3 text-[#999DA3]" />
                          </a>
                        )}
                        <div className="border-t border-[#E8E4DC] my-1" />
                        <button
                          onClick={() => {
                            setMenuOpenId(null);
                            handleDelete(opp.id);
                          }}
                          className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#DC2626]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer (Image 4 Right) */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E8E4DC]">
          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-[#E8E4DC] bg-white flex items-center justify-center text-xs text-[#555B64] hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'bg-[#E9F0EB] text-[#2D5542] font-semibold border border-[#C6DEC9]'
                      : 'bg-white text-[#555B64] border border-[#E8E4DC] hover:bg-[#FAF9F5]'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-[#E8E4DC] bg-white flex items-center justify-center text-xs text-[#555B64] hover:bg-[#FAF9F5] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Results Summary */}
          <p className="text-xs text-[#777D85]">
            Showing {startIndex}-{endIndex} of {filtered.length} opportunities
          </p>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, daysUntil, urgencyLabel, truncate } from '@/lib/utils';
import {
  FileText, CheckCircle2, Clock, Bookmark, ArrowRight,
  Plus, Calendar, ChevronRight, Compass, AlertCircle, Building2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch real data from user account
  const [
    { data: profile },
    { data: opportunities },
    { data: auditResults },
    { data: actionItems },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('opportunities').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('audit_results').select('status, opportunity_id').eq('owner_id', user.id),
    supabase.from('action_items').select('*').eq('owner_id', user.id).order('due_at', { ascending: true }).limit(5),
  ]);

  const allOpps = opportunities ?? [];
  const totalAnalyzed = allOpps.length;

  // Calculate eligible opportunities (opportunities where audit results have no MISMATCH)
  const auditedIds = new Set((auditResults ?? []).map(r => r.opportunity_id));
  const mismatchOppIds = new Set(
    (auditResults ?? []).filter(r => r.status === 'MISMATCH').map(r => r.opportunity_id)
  );

  const eligibleCount = Array.from(auditedIds).filter(id => !mismatchOppIds.has(id)).length;
  const inProgressCount = allOpps.filter(o => o.status === 'review' || o.status === 'draft').length;
  const savedCount = allOpps.filter(o => o.status === 'audited' || (o.preferences as Record<string, unknown>)?.bookmarked).length;

  const displayName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Student';

  // Deadlines
  const upcomingDeadlines = allOpps
    .filter(o => {
      const days = daysUntil(o.deadline);
      return days !== null && days >= 0;
    })
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner Row (Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#16233B]">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-sm text-[#555B64]">
            Here&apos;s your opportunity overview.
          </p>
        </div>

        {/* Header Campus Banner Card */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden p-6 text-white border border-[#E8E4DC] shadow-xs flex flex-col justify-center min-h-[120px]">
          <Image
            src="/images/campus-sunset.jpg"
            alt="Campus walkway banner"
            fill
            priority
            sizes="400px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#16233B]/75 backdrop-blur-xs" />
          <div className="relative z-10 space-y-1">
            <p className="text-sm font-semibold text-white">Stay consistent.</p>
            <p className="text-xs text-white/80 leading-relaxed">
              New opportunities are updated in real time.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards (Image 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[
          {
            icon: FileText,
            val: totalAnalyzed,
            title: "Opportunities Analyzed",
            sub: "Updated in real time",
            iconBg: "bg-[#E9F0EB] text-[#2D5542]",
          },
          {
            icon: CheckCircle2,
            val: eligibleCount,
            title: "Eligible Opportunities",
            sub: "Based on your profile",
            iconBg: "bg-[#F0FDF4] text-[#16A34A]",
          },
          {
            icon: Clock,
            val: inProgressCount,
            title: "In Progress",
            sub: "Applications in progress",
            iconBg: "bg-[#FFFBEB] text-[#D97706]",
          },
          {
            icon: Bookmark,
            val: savedCount,
            title: "Saved Opportunities",
            sub: "Bookmarked for later",
            iconBg: "bg-[#EFF6FF] text-[#2563EB]",
          },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-xs hover:border-[#D4CCC2] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#16233B] tracking-tight">{card.val}</p>
            <p className="text-xs font-semibold text-[#16233B] mt-1">{card.title}</p>
            <p className="text-[11px] text-[#777D85] mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Main 2-Column Section (Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Latest Opportunities (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
              Latest Opportunities
            </h2>
            <Link href="/app/opportunities" className="text-xs font-semibold text-[#2D5542] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {allOpps.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E8E4DC] text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] text-[#999DA3] flex items-center justify-center mx-auto border border-[#E8E4DC]">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-[#16233B]">No analyzed opportunities yet</h3>
                <p className="text-xs text-[#555B64] max-w-sm mx-auto">
                  Paste any internship, scholarship, or hackathon announcement to see your deterministic eligibility breakdown.
                </p>
              </div>
              <Link href="/app/analyze">
                <Button className="bg-[#16233B] hover:bg-[#20314F] text-white text-xs px-5 h-9 rounded-xl font-medium">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Analyze your first opportunity
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {allOpps.slice(0, 5).map((opp) => {
                const days = daysUntil(opp.deadline);
                const hasMismatch = mismatchOppIds.has(opp.id);
                const isAudited = auditedIds.has(opp.id);

                return (
                  <div
                    key={opp.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E4DC] shadow-xs hover:border-[#16233B]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] text-[#16233B] flex items-center justify-center font-bold text-sm shrink-0">
                        {opp.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <Link href={`/app/opportunities/${opp.id}`} className="font-semibold text-sm text-[#16233B] hover:underline block truncate">
                          {opp.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#777D85]">
                          <span className="capitalize">{opp.type}</span>
                          <span>·</span>
                          <span>Deadline: {formatDate(opp.deadline)}</span>
                          {days !== null && days <= 7 && days >= 0 && (
                            <span className="text-[#DC2626] font-medium">({urgencyLabel(days)})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {isAudited ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          hasMismatch
                            ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                            : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                        }`}>
                          {hasMismatch ? 'Not Eligible' : 'Eligible'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4EFEA] text-[#777D85] border border-[#E8E4DC]">
                          Review
                        </span>
                      )}

                      <Link href={`/app/opportunities/${opp.id}`}>
                        <Button variant="outline" size="sm" className="bg-[#FAF9F5] hover:bg-white border-[#E8E4DC] text-[#16233B] text-xs h-8 px-3 rounded-lg font-medium">
                          View Result →
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Application Progress & Upcoming Deadlines (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Your Application Progress Box */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-[#16233B]">
                Your Application Progress
              </h3>
              <Link href="/app/opportunities">
                <ChevronRight className="w-4 h-4 text-[#777D85]" />
              </Link>
            </div>

            <div className="space-y-4 pt-1">
              {[
                { label: "Application Submitted", title: "Target Opportunities", status: "Active", time: "Recent" },
                { label: "Eligibility Audit", title: "Requirements Engine", status: "Verified", time: "Live" },
                { label: "Action Roadmap", title: "Gaps & Milestones", status: "In Progress", time: "Pending" },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2D5542] ring-4 ring-[#E9F0EB]" />
                    {idx < 2 && <span className="w-0.5 h-10 bg-[#E8E4DC] my-1" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#16233B]">{step.label}</p>
                    <p className="text-[11px] text-[#777D85]">{step.title} · {step.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines Box */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-semibold text-[#16233B]">
                Upcoming Deadlines
              </h3>
              <Link href="/app/opportunities" className="text-xs font-medium text-[#2D5542] hover:underline">
                View all →
              </Link>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-[#777D85] py-2">No deadlines tracked yet.</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/app/opportunities/${opp.id}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#FAF9F5] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E8E4DC] text-[#16233B] flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-[#2D5542]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#16233B] group-hover:underline truncate">
                        {opp.title}
                      </p>
                      <p className="text-[11px] text-[#777D85]">
                        {formatDate(opp.deadline)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Recommendation Card (Image 2) */}
      <div className="p-6 rounded-2xl bg-white border border-[#E8E4DC] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-semibold text-sm text-[#16233B]">
              Find more opportunities that match your profile.
            </h4>
            <p className="text-xs text-[#555B64]">
              Run a new analysis to get personalized recommendations and check your eligibility.
            </p>
          </div>
        </div>

        <Link href="/app/analyze" className="shrink-0 w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#16233B] hover:bg-[#20314F] text-white px-5 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            Analyze Now <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

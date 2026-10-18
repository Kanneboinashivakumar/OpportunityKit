'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { CompanyLogo } from '@/components/opportunities/company-logo';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Edit2,
  X,
  Clock,
  Flag,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatDate, daysUntil, urgencyLabel } from '@/lib/utils';

interface AuditResult {
  id: string;
  requirement_id: string;
  status: 'MATCH' | 'MISMATCH' | 'MISSING_INFO';
  reason_code: string;
  explanation: string;
  evaluated_profile_value: unknown;
  next_action?: string;
  engine_version: string;
}

interface Requirement {
  id: string;
  category: string;
  label: string;
  operator: string;
  expected_value: unknown;
  required: boolean;
  notes?: string;
  source_text?: string;
}

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_at?: string;
  status: string;
}

interface Opportunity {
  id: string;
  title: string;
  type: string;
  status: string;
  deadline?: string;
  source_url?: string;
  raw_text: string;
  extraction_provider?: string;
  extraction_model?: string;
  extracted_at?: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'MATCH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E9F0EB] text-[#2D5542] border border-[#C6DEC9]">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5542]" />
        MATCH
      </span>
    );
  }
  if (status === 'MISMATCH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
        <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
        MISMATCH
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
      <HelpCircle className="w-3.5 h-3.5 text-[#B45309]" />
      MISSING INFO
    </span>
  );
}

const PRIORITY_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  urgent: { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', border: 'border-[#FECACA]' },
  high: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#FDE68A]' },
  medium: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', border: 'border-[#BAE6FD]' },
  low: { bg: 'bg-[#FAF9F5]', text: 'text-[#555B64]', border: 'border-[#E8E4DC]' },
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rerunning, setRerunning] = useState(false);
  const [error, setError] = useState('');
  const [fixingReq, setFixingReq] = useState<string | null>(null);
  const [fixValue, setFixValue] = useState('');
  const [fixSaving, setFixSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/opportunities/${id}`);
      if (!res.ok) {
        setError('Opportunity not found.');
        return;
      }
      const data = await res.json();
      setOpportunity(data.opportunity);
      setRequirements(data.requirements ?? []);
      setAuditResults(data.auditResults ?? []);
      setActionItems(data.actionItems ?? []);
    } catch {
      setError('Failed to load. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const initialLoad = async () => {
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        if (!res.ok) {
          if (!cancelled) setError('Opportunity not found.');
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setOpportunity(data.opportunity);
          setRequirements(data.requirements ?? []);
          setAuditResults(data.auditResults ?? []);
          setActionItems(data.actionItems ?? []);
        }
      } catch {
        if (!cancelled) setError('Failed to load. Please refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void initialLoad();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const rerunAudit = async () => {
    setRerunning(true);
    setError('');
    try {
      const res = await fetch(`/api/opportunities/${id}/audit`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Audit failed.');
        return;
      }
      setAuditResults(data.auditResults ?? []);
      setActionItems(data.actionItems ?? []);
      await load();
    } catch {
      setError('Audit failed. Please try again.');
    } finally {
      setRerunning(false);
    }
  };

  const openFix = (req: Requirement, audit: AuditResult) => {
    setFixingReq(req.id);
    const current = audit.evaluated_profile_value;
    setFixValue(current !== null && current !== undefined ? String(current) : '');
  };

  const saveFix = async (req: Requirement) => {
    const value = fixValue.trim();
    if (!value) {
      setError('Enter the value you want to save to your profile.');
      return;
    }
    const fields: Record<string, string> = {
      cgpa: 'cgpa',
      year: 'academic_year',
      branch: 'branch',
      academic: 'degree',
      github: 'github_url',
      portfolio: 'portfolio_url',
      availability: 'availability_weeks',
      marks: 'marks_percentage',
      income: 'annual_income',
      location: 'location',
      team_size: 'team_size',
    };
    const field = fields[req.category];
    if (!field && !['skill', 'document', 'work_authorization'].includes(req.category)) {
      setError(
        'This requirement needs profile fields that are not available yet. Update the requirement manually or add the information to your profile.'
      );
      return;
    }

    setFixSaving(true);
    setError('');
    try {
      const profileResponse = await fetch('/api/profile');
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profileData.error ?? 'Could not load your profile.');
      const profile = profileData.profile ?? {};
      let update: Record<string, unknown>;
      if (req.category === 'skill') {
        const skills = Array.isArray(profile.skills) ? (profile.skills as string[]) : [];
        const skillGaps = Array.isArray(profile.skill_gaps) ? (profile.skill_gaps as string[]) : [];
        const confirmedSkills = value.split(',').map((skill) => skill.trim()).filter(Boolean);
        update = {
          skills: [...new Set([...skills, ...confirmedSkills])],
          skill_gaps: skillGaps.filter(
            (skill) => !confirmedSkills.some((confirmed) => confirmed.toLowerCase() === skill.toLowerCase())
          ),
        };
      } else if (req.category === 'document') {
        const documents = Array.isArray(profile.documents) ? (profile.documents as string[]) : [];
        update = { documents: [...new Set([...documents, ...value.split(',').map((item) => item.trim()).filter(Boolean)])] };
      } else if (req.category === 'work_authorization') {
        if (!['yes', 'no', 'true', 'false'].includes(value.toLowerCase()))
          throw new Error('Enter yes or no to confirm work authorization.');
        update = { work_authorization: ['yes', 'true'].includes(value.toLowerCase()) };
      } else if (field === 'cgpa' || field === 'availability_weeks') {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) throw new Error('Enter a valid number.');
        update = { [field]: numericValue };
      } else if (field === 'marks_percentage' || field === 'annual_income' || field === 'team_size') {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) throw new Error('Enter a valid number.');
        update = { [field]: numericValue };
      } else {
        update = { [field]: value };
      }

      const saveResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) throw new Error(saveData.error ?? 'Profile update failed.');
      setFixingReq(null);
      await rerunAudit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed. Please try again.');
    } finally {
      setFixSaving(false);
    }
  };

  const getAuditForReq = (reqId: string) => auditResults.find((a) => a.requirement_id === reqId);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl pb-16">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-[#FEE2E2]/60 border border-[#FECACA] max-w-xl text-[#DC2626]">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Opportunity Not Found</p>
          <p className="text-xs text-[#555B64] mt-1">{error || 'Could not locate this opportunity analysis.'}</p>
          <Link href="/app/opportunities" className="inline-block mt-3">
            <Button size="sm" variant="outline" className="rounded-xl text-xs">
              Back to Opportunities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const deadlineDays = daysUntil(opportunity.deadline);
  const matches = auditResults.filter((a) => a.status === 'MATCH').length;
  const mismatches = auditResults.filter((a) => a.status === 'MISMATCH').length;
  const missing = auditResults.filter((a) => a.status === 'MISSING_INFO').length;

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div>
        <Link
          href="/app/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555B64] hover:text-[#16233B] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Opportunities</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <CompanyLogo title={opportunity.title} className="w-12 h-12" />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#16233B] tracking-tight">
                {opportunity.title}
              </h1>
              <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E8E4DC] text-xs font-medium text-[#555B64] capitalize">
                  {opportunity.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#E9F0EB] border border-[#C6DEC9] text-xs font-semibold text-[#2D5542] capitalize">
                  {opportunity.status === 'audited' ? 'Audited' : opportunity.status}
                </span>
                {opportunity.deadline && (
                  <span
                    className={`text-xs flex items-center gap-1 font-medium ${
                      deadlineDays !== null && deadlineDays <= 7
                        ? 'text-[#DC2626]'
                        : 'text-[#777D85]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(opportunity.deadline)}</span>
                    <span>·</span>
                    <span>{urgencyLabel(deadlineDays)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
            {opportunity.source_url ? (
              <a
                href={opportunity.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-[#2D5542] hover:bg-[#203D2F] text-white rounded-xl text-xs font-semibold h-9 gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Submit Application
                </Button>
              </a>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  alert('No external portal URL was extracted from this announcement. Please check the announcement text or official company careers page.');
                }}
                className="bg-[#2D5542] hover:bg-[#203D2F] text-white rounded-xl text-xs font-semibold h-9 gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Submit Application
              </Button>
            )}

            <Link href={`/app/analyze/${id}/review`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-[#E8E4DC] text-xs font-medium text-[#16233B] hover:bg-[#FAF9F5] h-9"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit Requirements
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={rerunAudit}
              disabled={rerunning}
              className="bg-[#16233B] hover:bg-[#20304C] text-white rounded-xl text-xs font-medium h-9 gap-1.5"
            >
              {rerunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Auditing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-run Audit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Scorecard (Honest Triage 3-Pillars) */}
      {auditResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-[#C6DEC9] bg-[#E9F0EB]/60 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D5542]">
                Match
              </span>
              <CheckCircle2 className="w-5 h-5 text-[#2D5542]" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#2D5542]">{matches}</p>
            <p className="text-xs text-[#555B64]">Requirements you satisfy today</p>
          </div>

          <div className="p-5 rounded-2xl border border-[#FDE68A] bg-[#FEF3C7]/60 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
                Missing Info
              </span>
              <HelpCircle className="w-5 h-5 text-[#B45309]" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#B45309]">{missing}</p>
            <p className="text-xs text-[#555B64]">Data omissions — fixable inline</p>
          </div>

          <div className="p-5 rounded-2xl border border-[#FECACA] bg-[#FEE2E2]/60 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                Mismatch
              </span>
              <XCircle className="w-5 h-5 text-[#DC2626]" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#DC2626]">{mismatches}</p>
            <p className="text-xs text-[#555B64]">Confirmed criteria gaps</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Audit Table */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E4DC] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#16233B]">
              Deterministic Eligibility Audit
            </h2>
            <p className="text-xs text-[#777D85] mt-0.5">
              Engine version {auditResults[0]?.engine_version || '1.0.0'} · Evaluated with rule-based precision
            </p>
          </div>
          <span className="text-xs font-medium text-[#2D5542] bg-[#E9F0EB] px-3 py-1 rounded-full border border-[#C6DEC9]">
            {requirements.length} Requirements Tested
          </span>
        </div>

        {requirements.length === 0 ? (
          <p className="text-xs text-[#777D85] p-8 text-center">
            No requirements found for this opportunity. Click &ldquo;Edit Requirements&rdquo; to add some.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E8E4DC] text-[#777D85] font-semibold">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Your Profile Value</th>
                  <th className="py-3 px-4">Explanation</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DC] text-[#555B64]">
                {requirements.map((req) => {
                  const audit = getAuditForReq(req.id);
                  const isFixing = fixingReq === req.id;
                  const canFixInProfile = [
                    'cgpa',
                    'year',
                    'branch',
                    'academic',
                    'skill',
                    'github',
                    'portfolio',
                    'availability',
                    'marks',
                    'income',
                    'location',
                    'team_size',
                    'document',
                    'work_authorization',
                  ].includes(req.category);

                  return (
                    <tr key={req.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {audit ? (
                          <StatusBadge status={audit.status} />
                        ) : (
                          <span className="text-[#999DA3]">Pending</span>
                        )}
                      </td>

                      {/* Requirement */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <p className="font-semibold text-[#16233B]">{req.label}</p>
                        <p className="text-[11px] text-[#999DA3] mt-0.5 font-mono">
                          {req.category} · {req.operator}
                        </p>
                      </td>

                      {/* Profile Value */}
                      <td className="py-3.5 px-4 max-w-[160px]">
                        {isFixing ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              value={fixValue}
                              onChange={(e) => setFixValue(e.target.value)}
                              className="h-8 text-xs w-28 rounded-lg"
                              placeholder="Enter value"
                              autoFocus
                            />
                            <button
                              onClick={() => saveFix(req)}
                              disabled={fixSaving}
                              className="p-1.5 rounded-lg bg-[#E9F0EB] text-[#2D5542] hover:bg-[#C6DEC9]"
                              title="Save to profile"
                            >
                              {fixSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setFixingReq(null)}
                              className="p-1.5 rounded-lg text-[#999DA3] hover:text-[#16233B]"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono text-[#16233B] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E8E4DC] text-[11px]">
                            {audit?.evaluated_profile_value !== null &&
                            audit?.evaluated_profile_value !== undefined
                              ? String(audit.evaluated_profile_value).slice(0, 35)
                              : '—'}
                          </span>
                        )}
                      </td>

                      {/* Explanation */}
                      <td className="py-3.5 px-4 max-w-[260px] text-[#555B64] leading-relaxed">
                        {audit?.explanation ?? 'Run audit to evaluate.'}
                      </td>

                      {/* Safe Next Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {audit?.status === 'MISSING_INFO' &&
                          ['PROFILE_VALUE_MISSING', 'PROFILE_CGPA_MISSING'].includes(audit.reason_code) &&
                          canFixInProfile && (
                            <button
                              onClick={() => openFix(req, audit)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D5542] hover:underline bg-[#E9F0EB] px-2.5 py-1 rounded-lg border border-[#C6DEC9]"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Fix Inline</span>
                            </button>
                          )}

                        {audit?.next_action && audit.status !== 'MISSING_INFO' && (
                          <span className="text-[11px] text-[#777D85]">{audit.next_action}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Plan */}
      {actionItems.length > 0 && (
        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#2D5542]" />
            <h2 className="text-base font-semibold text-[#16233B]">
              Personalized Deadline-Aware Action Plan
            </h2>
          </div>

          <div className="space-y-3">
            {actionItems.map((item) => {
              const badgeStyle = PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.low;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#E8E4DC] bg-[#FAF9F5]/40 flex items-start gap-3.5 hover:border-[#D5CFBF] transition-colors"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 mt-0.5 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                  >
                    {item.priority}
                  </span>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-semibold text-[#16233B]">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-[#555B64] leading-relaxed">{item.description}</p>
                    )}
                    {item.due_at && (
                      <p className="text-[11px] text-[#777D85] pt-0.5">
                        Target Date: {formatDate(item.due_at)}
                      </p>
                    )}
                  </div>

                  <span className="text-[11px] text-[#999DA3] font-mono shrink-0 bg-white px-2 py-0.5 rounded border border-[#E8E4DC]">
                    {item.category}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Direct Portal Apply Banner */}
          <div className="mt-4 p-4 rounded-xl bg-[#E9F0EB]/60 border border-[#C6DEC9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="font-semibold text-xs sm:text-sm text-[#16233B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5542]" /> Ready to Apply?
              </h3>
              <p className="text-xs text-[#555B64]">
                Proceed to the official application portal to submit your application before the deadline.
              </p>
            </div>
            {opportunity.source_url ? (
              <a
                href={opportunity.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button className="bg-[#2D5542] hover:bg-[#203D2F] text-white rounded-xl text-xs font-semibold h-9 px-4 gap-1.5 shadow-sm">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Submit on Official Portal
                </Button>
              </a>
            ) : (
              <Button
                onClick={() => alert('No external portal URL was found in this announcement. Please check the official organization website or announcement text.')}
                className="bg-[#2D5542] hover:bg-[#203D2F] text-white rounded-xl text-xs font-semibold h-9 px-4 gap-1.5 shadow-sm shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Submit Application
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Provenance & Source Metadata */}
      <div className="flex items-center justify-between text-xs text-[#999DA3] pt-4 border-t border-[#E8E4DC]">
        <div>
          {opportunity.extraction_provider ? (
            <span>
              Extracted via {opportunity.extraction_provider} ({opportunity.extraction_model})
              {opportunity.extracted_at && ` · ${formatDate(opportunity.extracted_at)}`}
            </span>
          ) : (
            <span>Entered & audited manually</span>
          )}
        </div>

        {opportunity.source_url && (
          <a
            href={opportunity.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-[#2D5542] hover:underline"
          >
            <span>Original Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

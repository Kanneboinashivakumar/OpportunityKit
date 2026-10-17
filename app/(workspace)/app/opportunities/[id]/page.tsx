'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2, XCircle, HelpCircle, AlertCircle, Loader2,
  RefreshCw, ArrowLeft, Edit2, X, Clock, Flag,
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

function StatusIcon({ status }: { status: string }) {
  if (status === 'MATCH') return <CheckCircle2 className="w-4 h-4 text-[var(--color-match)]" />;
  if (status === 'MISMATCH') return <XCircle className="w-4 h-4 text-[var(--color-mismatch)]" />;
  return <HelpCircle className="w-4 h-4 text-[var(--color-missing)]" />;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'MATCH') return <Badge variant="match">MATCH</Badge>;
  if (status === 'MISMATCH') return <Badge variant="mismatch">MISMATCH</Badge>;
  return <Badge variant="missing">MISSING INFO</Badge>;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-[var(--color-mismatch)]',
  high: 'text-[var(--color-missing)]',
  medium: 'text-[var(--color-navy)]',
  low: 'text-[var(--color-text-muted)]',
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
      if (!res.ok) { setError('Opportunity not found.'); return; }
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
    return () => { cancelled = true; };
  }, [id]);

  const rerunAudit = async () => {
    setRerunning(true);
    setError('');
    try {
      const res = await fetch(`/api/opportunities/${id}/audit`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Audit failed.'); return; }
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
      cgpa: 'cgpa', year: 'academic_year', branch: 'branch', academic: 'degree',
      github: 'github_url', portfolio: 'portfolio_url', availability: 'availability_weeks',
      marks: 'marks_percentage', income: 'annual_income', location: 'location',
      team_size: 'team_size',
    };
    const field = fields[req.category];
    if (!field && !['skill', 'document', 'work_authorization'].includes(req.category)) {
      setError('This requirement needs profile fields that are not available yet. Update the requirement manually or add the information to your profile.');
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
        const skills = Array.isArray(profile.skills) ? profile.skills as string[] : [];
        const skillGaps = Array.isArray(profile.skill_gaps) ? profile.skill_gaps as string[] : [];
        const confirmedSkills = value.split(',').map((skill) => skill.trim()).filter(Boolean);
        update = {
          skills: [...new Set([...skills, ...confirmedSkills])],
          skill_gaps: skillGaps.filter((skill) => !confirmedSkills.some((confirmed) => confirmed.toLowerCase() === skill.toLowerCase())),
        };
      } else if (req.category === 'document') {
        const documents = Array.isArray(profile.documents) ? profile.documents as string[] : [];
        update = { documents: [...new Set([...documents, ...value.split(',').map((item) => item.trim()).filter(Boolean)])] };
      } else if (req.category === 'work_authorization') {
        if (!['yes', 'no', 'true', 'false'].includes(value.toLowerCase())) throw new Error('Enter yes or no to confirm work authorization.');
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

  const getAuditForReq = (reqId: string) =>
    auditResults.find((a) => a.requirement_id === reqId);

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-mismatch-bg)] border border-[var(--color-mismatch-border)] max-w-xl">
        <AlertCircle className="w-4 h-4 text-[var(--color-mismatch)] shrink-0 mt-0.5" />
        <p className="text-sm text-[var(--color-mismatch)]">{error || 'Not found.'}</p>
      </div>
    );
  }

  const deadlineDays = daysUntil(opportunity.deadline);
  const matches = auditResults.filter((a) => a.status === 'MATCH').length;
  const mismatches = auditResults.filter((a) => a.status === 'MISMATCH').length;
  const missing = auditResults.filter((a) => a.status === 'MISSING_INFO').length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link href="/app/opportunities" className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to saved
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-navy)] leading-tight">{opportunity.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <Badge variant="secondary" className="capitalize">{opportunity.type}</Badge>
              <Badge variant={opportunity.status === 'audited' ? 'match' : 'secondary'} className="capitalize">
                {opportunity.status}
              </Badge>
              {opportunity.deadline && (
                <span className={`text-xs flex items-center gap-1 ${deadlineDays !== null && deadlineDays <= 7 ? 'text-[var(--color-mismatch)]' : 'text-[var(--color-text-subtle)]'}`}>
                  <Clock className="w-3 h-3" /> {formatDate(opportunity.deadline)} · {urgencyLabel(deadlineDays)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/app/analyze/${id}/review`}>
              <Button variant="outline" size="sm">Edit requirements</Button>
            </Link>
            <Button size="sm" onClick={rerunAudit} disabled={rerunning} variant="secondary">
              {rerunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Re-run audit
            </Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {auditResults.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Match', value: matches, color: 'text-[var(--color-match)]', bg: 'bg-[var(--color-match-bg)] border-[var(--color-match-border)]' },
            { label: 'Mismatch', value: mismatches, color: 'text-[var(--color-mismatch)]', bg: 'bg-[var(--color-mismatch-bg)] border-[var(--color-mismatch-border)]' },
            { label: 'Missing info', value: missing, color: 'text-[var(--color-missing)]', bg: 'bg-[var(--color-missing-bg)] border-[var(--color-missing-border)]' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-lg border p-4 ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-mismatch-bg)] border border-[var(--color-mismatch-border)]">
          <AlertCircle className="w-4 h-4 text-[var(--color-mismatch)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-mismatch)]">{error}</p>
        </div>
      )}

      {/* Audit table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Eligibility audit</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {requirements.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] p-6">No requirements to audit.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {['Status', 'Requirement', 'Your value', 'Explanation', 'Action'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-subtle)] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {requirements.map((req) => {
                    const audit = getAuditForReq(req.id);
                    const isFixing = fixingReq === req.id;
                    const canFixInProfile = ['cgpa', 'year', 'branch', 'academic', 'skill', 'github', 'portfolio', 'availability', 'marks', 'income', 'location', 'team_size', 'document', 'work_authorization'].includes(req.category);
                    return (
                      <tr key={req.id} className="hover:bg-[var(--color-surface)] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {audit ? (
                            <div className="flex items-center gap-1.5">
                              <StatusIcon status={audit.status} />
                              <StatusBadge status={audit.status} />
                            </div>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="font-medium text-[var(--color-text)] text-xs leading-snug">{req.label}</p>
                          <code className="text-xs text-[var(--color-text-subtle)]">{req.category} · {req.operator}</code>
                        </td>
                        <td className="px-4 py-3 max-w-[140px]">
                          {isFixing ? (
                            <div className="flex items-center gap-1.5">
                              <Input
                                value={fixValue}
                                onChange={(e) => setFixValue(e.target.value)}
                                className="h-7 text-xs w-24"
                                placeholder="Enter value"
                                aria-label={`Confirm ${req.category} value for your profile`}
                              />
                              <button
                                onClick={() => saveFix(req)}
                                disabled={fixSaving}
                                className="text-[var(--color-match)] hover:opacity-70"
                              >
                                {fixSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => setFixingReq(null)} className="text-[var(--color-text-subtle)] hover:opacity-70">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--color-text-muted)] font-mono">
                              {audit?.evaluated_profile_value !== null && audit?.evaluated_profile_value !== undefined
                                ? String(audit.evaluated_profile_value).slice(0, 40)
                                : '—'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <p className="text-xs text-[var(--color-text-muted)] leading-snug">
                            {audit?.explanation ?? 'Run the audit to evaluate.'}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {audit?.status === 'MISSING_INFO' && ['PROFILE_VALUE_MISSING', 'PROFILE_CGPA_MISSING'].includes(audit.reason_code) && canFixInProfile && (
                            <button
                              onClick={() => openFix(req, audit)}
                              className="flex items-center gap-1 text-xs text-[var(--color-navy)] hover:underline"
                            >
                              <Edit2 className="w-3 h-3" /> Fix
                            </button>
                          )}
                          {audit?.next_action && audit.status !== 'MISSING_INFO' && (
                            <p className="text-xs text-[var(--color-text-subtle)] max-w-[120px] leading-snug">{audit.next_action}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action plan */}
      {actionItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Flag className="w-4 h-4" /> Action plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                  <span className={`text-xs font-semibold mt-0.5 ${PRIORITY_COLORS[item.priority]}`}>
                    {item.priority.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)]">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug">{item.description}</p>
                    )}
                    {item.due_at && (
                      <p className="text-xs text-[var(--color-text-subtle)] mt-1">
                        Due: {formatDate(item.due_at)}
                      </p>
                    )}
                  </div>
                  <code className="text-xs text-[var(--color-text-subtle)] shrink-0">{item.category}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extraction metadata */}
      <div className="text-xs text-[var(--color-text-subtle)] border-t border-[var(--color-border)] pt-4">
        {opportunity.extraction_provider && (
          <span>
            Extracted by {opportunity.extraction_provider}/{opportunity.extraction_model}
            {opportunity.extracted_at && ` on ${formatDate(opportunity.extracted_at)}`}
          </span>
        )}
        {opportunity.source_url && (
          <a
            href={opportunity.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 text-[var(--color-navy)] hover:underline"
          >
            Source ↗
          </a>
        )}
      </div>
    </div>
  );
}

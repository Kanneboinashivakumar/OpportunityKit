'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle, AlertCircle, Info, Loader2, Edit2, Trash2,
  ChevronRight, Eye, EyeOff, Plus, X,
} from 'lucide-react';

interface Requirement {
  id: string;
  category: string;
  label: string;
  operator: string;
  expected_value: unknown;
  required: boolean;
  source_text?: string;
  confidence?: number;
  needs_review: boolean;
  notes?: string;
  sort_order: number;
}

interface Opportunity {
  id: string;
  title: string;
  type: string;
  deadline?: string;
  status: string;
}

const CATEGORIES = [
  'academic','branch','year','cgpa','marks','income','skill',
  'document','portfolio','github','availability','team_size',
  'deadline','location','work_authorization','other',
];
const OPERATORS = [
  'GTE','LTE','EQ','IN','ARRAY_INCLUDES','ARRAY_CONTAINS_ALL',
  'REQUIRED_TRUE','DATE_BEFORE','DATE_AFTER','TEXT_PRESENT','MANUAL_REVIEW',
];

function confidenceLabel(c?: number | null): { text: string; color: string } {
  if (c === null || c === undefined) return { text: 'Unknown', color: 'text-[var(--color-text-subtle)]' };
  if (c >= 0.85) return { text: 'High confidence', color: 'text-[var(--color-match)]' };
  if (c >= 0.6) return { text: 'Medium confidence', color: 'text-[var(--color-missing)]' };
  return { text: 'Low confidence — review carefully', color: 'text-[var(--color-mismatch)]' };
}

export default function ReviewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSource, setShowSource] = useState<Record<string, boolean>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [newOperator, setNewOperator] = useState('MANUAL_REVIEW');
  const [newExpected, setNewExpected] = useState('');
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
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
        }
      } catch {
        if (!cancelled) setError('Failed to load. Please refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [id]);

  const deleteReq = async (reqId: string) => {
    if (!confirm('Remove this requirement?')) return;
    try {
      const res = await fetch(`/api/opportunities/${id}/requirements?requirementId=${reqId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not remove this requirement.');
      setRequirements((r) => r.filter((x) => x.id !== reqId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this requirement.');
    }
  };

  const updateReq = async (reqId: string, update: Partial<Requirement>) => {
    const res = await fetch(`/api/opportunities/${id}/requirements`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirementId: reqId, update }),
    });
    if (res.ok) {
      const data = await res.json();
      setRequirements((r) => r.map((x) => (x.id === reqId ? { ...x, ...data.requirement } : x)));
      setEditingId(null);
      setError('');
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not save the requirement.');
    }
  };

  const addRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    let expected: unknown = null;
    if (newExpected.trim()) {
      try { expected = JSON.parse(newExpected); }
      catch { expected = newExpected.trim(); }
    }
    setSavingNew(true);
    setError('');
    try {
      const res = await fetch(`/api/opportunities/${id}/requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory, label: newLabel.trim(), operator: newOperator, expected_value: expected, required: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not add the requirement.');
      setRequirements((current) => [...current, data.requirement]);
      setNewLabel('');
      setNewExpected('');
      setAddOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the requirement.');
    } finally {
      setSavingNew(false);
    }
  };

  const runAudit = async () => {
    setRunning(true);
    try {
      const res = await fetch(`/api/opportunities/${id}/audit`, { method: 'POST' });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Audit failed.');
        return;
      }
      router.push(`/app/opportunities/${id}`);
    } catch {
      setError('Audit failed. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const toggleSource = (reqId: string) =>
    setShowSource((s) => ({ ...s, [reqId]: !s[reqId] }));

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-mismatch-bg)] border border-[var(--color-mismatch-border)] max-w-xl">
        <AlertCircle className="w-4 h-4 text-[var(--color-mismatch)] shrink-0 mt-0.5" />
        <p className="text-sm text-[var(--color-mismatch)]">{error || 'Opportunity not found.'}</p>
      </div>
    );
  }

  const needsReviewCount = requirements.filter((r) => r.needs_review).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-2">
          <span>Review requirements</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text)]">Run audit</span>
        </div>
        <h1 className="text-xl font-semibold text-[var(--color-navy)] leading-tight">{opportunity.title}</h1>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="secondary" className="capitalize">{opportunity.type}</Badge>
          {opportunity.deadline && (
            <span className="text-xs text-[var(--color-text-subtle)]">
              Deadline: {new Date(opportunity.deadline).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>
      </div>

      {needsReviewCount > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-missing-bg)] border border-[var(--color-missing-border)]">
          <Info className="w-4 h-4 text-[var(--color-missing)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-text-muted)]">
            <strong>{needsReviewCount} requirement{needsReviewCount > 1 ? 's' : ''}</strong> flagged for review.
            The AI was less certain — inspect source snippets and correct if needed before running the audit.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {requirements.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] py-6 text-center">
            No requirements extracted. You can still run the audit with an empty set.
          </p>
        )}
        {requirements.map((req) => {
          const conf = confidenceLabel(req.confidence as number | undefined);
          const isEditing = editingId === req.id;
          return (
            <RequirementCard
              key={req.id}
              req={req}
              isEditing={isEditing}
              showSource={!!showSource[req.id]}
              confLabel={conf}
              onEdit={() => setEditingId(isEditing ? null : req.id)}
              onConfirm={() => updateReq(req.id, { needs_review: false })}
              onDelete={() => deleteReq(req.id)}
              onToggleSource={() => toggleSource(req.id)}
              onSave={(update) => updateReq(req.id, update)}
              onCancel={() => setEditingId(null)}
            />
          );
        })}
      </div>

      {addOpen ? (
        <form onSubmit={addRequirement} className="space-y-3 rounded-lg border border-[var(--color-border)] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-navy)]">Add a requirement</h2>
            <button type="button" onClick={() => setAddOpen(false)} aria-label="Cancel adding requirement" className="text-[var(--color-text-subtle)]"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-req-label">Requirement</Label>
            <Input id="new-req-label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} maxLength={300} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="new-req-category">Category</Label>
              <select id="new-req-category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="h-9 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm">
                {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-req-operator">Operator</Label>
              <select id="new-req-operator" value={newOperator} onChange={(e) => setNewOperator(e.target.value)} className="h-9 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm">
                {OPERATORS.map((operator) => <option key={operator} value={operator}>{operator}</option>)}
              </select>
            </div>
          </div>
          {newOperator !== 'MANUAL_REVIEW' && (
            <div className="grid gap-1.5">
              <Label htmlFor="new-req-value">Expected value</Label>
              <Input id="new-req-value" value={newExpected} onChange={(e) => setNewExpected(e.target.value)} placeholder='JSON value, e.g. 7.5 or "Python"' />
            </div>
          )}
          <Button type="submit" size="sm" disabled={savingNew || !newLabel.trim()}>{savingNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add requirement</Button>
        </form>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add requirement</Button>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-mismatch-bg)] border border-[var(--color-mismatch-border)]">
          <AlertCircle className="w-4 h-4 text-[var(--color-mismatch)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--color-mismatch)]">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pb-6">
        <Button size="lg" onClick={runAudit} disabled={running || needsReviewCount > 0}>
          {running ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running audit…</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Run eligibility audit</>
          )}
        </Button>
        <p className="text-xs text-[var(--color-text-subtle)]">
          Deterministic — no AI guessing on eligibility
        </p>
      </div>
    </div>
  );
}

function RequirementCard({
  req, isEditing, showSource, confLabel, onEdit, onConfirm, onDelete, onToggleSource, onSave, onCancel,
}: {
  req: Requirement;
  isEditing: boolean;
  showSource: boolean;
  confLabel: { text: string; color: string };
  onEdit: () => void;
  onConfirm: () => void;
  onDelete: () => void;
  onToggleSource: () => void;
  onSave: (update: Partial<Requirement>) => void;
  onCancel: () => void;
}) {
  const [editLabel, setEditLabel] = useState(req.label);
  const [editCategory, setEditCategory] = useState(req.category);
  const [editOperator, setEditOperator] = useState(req.operator);
  const [editExpected, setEditExpected] = useState(
    req.expected_value !== null && req.expected_value !== undefined
      ? JSON.stringify(req.expected_value)
      : ''
  );
  const [editNotes, setEditNotes] = useState(req.notes ?? '');
  const [editRequired, setEditRequired] = useState(req.required);

  const handleSave = () => {
    let parsedExpected: unknown = editExpected;
    try {
      if (editExpected.trim()) parsedExpected = JSON.parse(editExpected);
    } catch { /* keep as string */ }
    onSave({
      label: editLabel,
      category: editCategory as Requirement['category'],
      operator: editOperator as Requirement['operator'],
      expected_value: parsedExpected,
      notes: editNotes,
      required: editRequired,
      needs_review: false,
    });
  };

  return (
    <Card className={req.needs_review ? 'border-[var(--color-missing-border)]' : ''}>
      <CardContent className="pt-4 pb-4">
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid gap-1.5">
              <Label>Label</Label>
              <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-navy)]"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label>Operator</Label>
                <select
                  value={editOperator}
                  onChange={(e) => setEditOperator(e.target.value)}
                  className="h-9 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-navy)]"
                >
                  {OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Expected value (JSON)</Label>
              <Input
                value={editExpected}
                onChange={(e) => setEditExpected(e.target.value)}
                placeholder='e.g. 7.5 or "Python" or ["React","Node"]'
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Notes</Label>
              <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Optional clarification" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`req-${req.id}`}
                checked={editRequired}
                onChange={(e) => setEditRequired(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor={`req-${req.id}`}>Required</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start gap-2 flex-wrap">
                <p className="text-sm font-medium text-[var(--color-text)]">{req.label}</p>
                {req.needs_review && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-[var(--color-missing-bg)] text-[var(--color-missing)] border border-[var(--color-missing-border)]">
                    Review
                  </span>
                )}
                {!req.required && (
                  <span className="text-xs text-[var(--color-text-subtle)]">optional</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-subtle)]">
                <code className="bg-[var(--color-surface)] px-1.5 py-0.5 rounded">{req.category}</code>
                <code className="bg-[var(--color-surface)] px-1.5 py-0.5 rounded">{req.operator}</code>
                {req.expected_value !== null && req.expected_value !== undefined && (
                  <code className="bg-[var(--color-surface)] px-1.5 py-0.5 rounded max-w-[200px] truncate">
                    = {JSON.stringify(req.expected_value)}
                  </code>
                )}
              </div>
              {req.source_text && showSource && (
                <blockquote className="mt-2 text-xs text-[var(--color-text-muted)] border-l-2 border-[var(--color-border)] pl-3 italic">
                  &ldquo;{req.source_text}&rdquo;
                </blockquote>
              )}
              <div className="flex items-center gap-3 pt-0.5">
                <span className={`text-xs ${confLabel.color}`}>{confLabel.text}</span>
                {req.notes && (
                  <span className="text-xs text-[var(--color-text-subtle)]">{req.notes}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {req.needs_review && (
                <button onClick={onConfirm} className="px-2 py-1 rounded text-xs text-[var(--color-match)] hover:bg-[var(--color-match-bg)]" title="Confirm this requirement as reviewed">Confirm</button>
              )}
              {req.source_text && (
                <button
                  onClick={onToggleSource}
                  className="p-1.5 rounded hover:bg-[var(--color-surface)] text-[var(--color-text-subtle)]"
                  title={showSource ? 'Hide source' : 'Show source'}
                >
                  {showSource ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={onEdit}
                className="p-1.5 rounded hover:bg-[var(--color-surface)] text-[var(--color-text-subtle)]"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-[var(--color-mismatch-bg)] text-[var(--color-text-subtle)] hover:text-[var(--color-mismatch)]"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

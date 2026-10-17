'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Plus, X, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface Profile {
  full_name?: string;
  degree?: string;
  branch?: string;
  academic_year?: string;
  cgpa?: number | null;
  cgpa_scale?: number;
  marks_percentage?: number | null;
  annual_income?: number | null;
  skills?: string[];
  skill_gaps?: string[];
  documents?: string[];
  location?: string;
  work_authorization?: boolean | null;
  team_size?: number | null;
  github_url?: string;
  portfolio_url?: string;
  availability_weeks?: number | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({ cgpa_scale: 10, skills: [], skill_gaps: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newSkillGap, setNewSkillGap] = useState('');
  const [newDocument, setNewDocument] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load profile.');
        if (data.profile && !cancelled) {
          setProfile({
            ...data.profile,
            skills: data.profile.skills ?? [],
            skill_gaps: data.profile.skill_gaps ?? [],
            documents: data.profile.documents ?? [],
            cgpa_scale: data.profile.cgpa_scale ?? 10,
          });
        }
      } catch {
        if (!cancelled) setError('Failed to load profile. Please refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadProfile();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save profile.');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !(profile.skills ?? []).map(x => x.toLowerCase()).includes(s.toLowerCase())) {
      setProfile((p) => ({ ...p, skills: [...(p.skills ?? []), s], skill_gaps: (p.skill_gaps ?? []).filter((item) => item.toLowerCase() !== s.toLowerCase()) }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((p) => ({ ...p, skills: (p.skills ?? []).filter((s) => s !== skill) }));
  };

  const addSkillGap = () => {
    const skill = newSkillGap.trim();
    if (skill && !(profile.skill_gaps ?? []).some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setProfile((p) => ({ ...p, skill_gaps: [...(p.skill_gaps ?? []), skill], skills: (p.skills ?? []).filter((item) => item.toLowerCase() !== skill.toLowerCase()) }));
      setNewSkillGap('');
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-navy)]">Your Profile</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Used across all analyses. Never shared without your consent.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--color-mismatch-bg)] border border-[var(--color-mismatch-border)] text-sm text-[var(--color-mismatch)]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Personal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="full_name">Full name <span className="text-[var(--color-mismatch)]">*</span></Label>
              <Input
                id="full_name"
                value={profile.full_name ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Priya Sharma"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Academic details</CardTitle>
            <CardDescription>Used for CGPA, year, branch, and degree eligibility checks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={profile.degree ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, degree: e.target.value }))}
                  placeholder="B.Tech / B.E. / M.Tech"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="branch">Branch / Major</Label>
                <Input
                  id="branch"
                  value={profile.branch ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, branch: e.target.value }))}
                  placeholder="Computer Science"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="year">Academic year</Label>
                <Input
                  id="year"
                  value={profile.academic_year ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, academic_year: e.target.value }))}
                  placeholder="3rd year"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cgpa">CGPA</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  value={profile.cgpa ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, cgpa: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="8.5"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cgpa_scale">Scale</Label>
                <Input
                  id="cgpa_scale"
                  type="number"
                  step="0.1"
                  min="1"
                  value={profile.cgpa_scale ?? 10}
                  onChange={(e) => setProfile((p) => ({ ...p, cgpa_scale: Number(e.target.value) }))}
                  placeholder="10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional eligibility details</CardTitle>
            <CardDescription>These optional details are used only when an opportunity states a matching requirement.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="marks_percentage">Marks (%)</Label>
                <Input id="marks_percentage" type="number" min="0" max="100" step="0.01" value={profile.marks_percentage ?? ''} onChange={(e) => setProfile((p) => ({ ...p, marks_percentage: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="annual_income">Annual family income (₹)</Label>
                <Input id="annual_income" type="number" min="0" step="1" value={profile.annual_income ?? ''} onChange={(e) => setProfile((p) => ({ ...p, annual_income: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="location">Current location</Label>
                <Input id="location" value={profile.location ?? ''} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} placeholder="City, state or region" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="work_authorization">Work authorization</Label>
                <select id="work_authorization" value={profile.work_authorization === true ? 'yes' : profile.work_authorization === false ? 'no' : ''} onChange={(e) => setProfile((p) => ({ ...p, work_authorization: e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null }))} className="h-9 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm">
                  <option value="">Unknown</option><option value="yes">Confirmed yes</option><option value="no">Confirmed no</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="team_size">Current team size (if applicable)</Label>
                <Input id="team_size" type="number" min="1" max="100" step="1" value={profile.team_size ?? ''} onChange={(e) => setProfile((p) => ({ ...p, team_size: e.target.value ? Number(e.target.value) : null }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-document">Documents you have (names only)</Label>
              <div className="flex gap-2">
                <Input id="new-document" value={newDocument} onChange={(e) => setNewDocument(e.target.value)} placeholder="e.g. Transcript, ID proof" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const doc = newDocument.trim(); if (doc) setProfile((p) => ({ ...p, documents: [...new Set([...(p.documents ?? []), doc])] })); setNewDocument(''); } }} />
                <Button type="button" variant="outline" size="icon" aria-label="Add document name" onClick={() => { const doc = newDocument.trim(); if (doc) setProfile((p) => ({ ...p, documents: [...new Set([...(p.documents ?? []), doc])] })); setNewDocument(''); }}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.documents ?? []).map((doc) => <span key={doc} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[var(--color-surface)] border border-[var(--color-border)]">{doc}<button type="button" aria-label={`Remove ${doc}`} onClick={() => setProfile((p) => ({ ...p, documents: (p.documents ?? []).filter((item) => item !== doc) }))}><X className="h-3 w-3" /></button></span>)}
              </div>
              <p className="text-xs text-[var(--color-text-subtle)]">Only document names are stored here; do not upload private document contents.</p>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skills</CardTitle>
            <CardDescription>
              Only add skills you genuinely possess. Skill gaps are flagged honestly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Python, React, Machine Learning"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addSkill} aria-label="Add skill">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {(profile.skills ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(profile.skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-navy-50)] text-[var(--color-navy)] border border-[var(--color-navy-50)]"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="hover:text-[var(--color-mismatch)] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="border-t border-[var(--color-border)] pt-3 space-y-2">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Skills you confirm you do not currently have</p>
                <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">Only list a gap when you want it reported as a confirmed mismatch. Unlisted skills remain MISSING INFO.</p>
              </div>
              <div className="flex gap-2">
                <Input value={newSkillGap} onChange={(e) => setNewSkillGap(e.target.value)} placeholder="Confirm a current skill gap" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkillGap(); } }} />
                <Button type="button" variant="outline" size="icon" onClick={addSkillGap} aria-label="Add confirmed skill gap"><Plus className="w-4 h-4" /></Button>
              </div>
              {(profile.skill_gaps ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(profile.skill_gaps ?? []).map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-mismatch-bg)] text-[var(--color-mismatch)] border border-[var(--color-mismatch-border)]">
                      {skill}<button type="button" onClick={() => setProfile((p) => ({ ...p, skill_gaps: (p.skill_gaps ?? []).filter((item) => item !== skill) }))} aria-label={`Remove confirmed gap ${skill}`}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Links & availability</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={profile.github_url ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, github_url: e.target.value }))}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="portfolio_url">Portfolio / Personal site</Label>
              <Input
                id="portfolio_url"
                type="url"
                value={profile.portfolio_url ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, portfolio_url: e.target.value }))}
                placeholder="https://yoursite.dev"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="availability">Availability (weeks)</Label>
              <Input
                id="availability"
                type="number"
                min="0"
                max="104"
                value={profile.availability_weeks ?? ''}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, availability_weeks: e.target.value ? Number(e.target.value) : null }))
                }
                placeholder="8"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pb-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save profile</>
            )}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[var(--color-match)]">
              <CheckCircle className="w-4 h-4" /> Profile saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

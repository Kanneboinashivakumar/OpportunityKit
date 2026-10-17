'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, ArrowRight, Save, CheckCircle2, AlertCircle, Loader2,
  Upload, FileText, Check, Plus, X, Sparkles, HelpCircle,
  Briefcase, GraduationCap, Calendar, Compass, Shield
} from 'lucide-react';

interface ProfileData {
  full_name?: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  current_location?: string;
  college?: string;
  degree?: string;
  branch?: string;
  academic_year?: string;
  cgpa?: number | null;
  cgpa_scale?: number;
  marks_percentage?: number | null;
  annual_income?: number | null;
  skills?: string[];
  skill_gaps?: string[];
  github_url?: string;
  portfolio_url?: string;
  availability_weeks?: number | null;
  work_authorization?: boolean | null;
  team_size?: number | null;
  location?: string;
  preferences?: Record<string, unknown>;
}

const STEPS = [
  { id: 1, label: 'Basic Information' },
  { id: 2, label: 'Education' },
  { id: 3, label: 'Preferences' },
  { id: 4, label: 'Skills & Interests' },
  { id: 5, label: 'Review' },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData>({
    cgpa_scale: 10,
    skills: [],
    skill_gaps: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState('');

  // Resume parsing states
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

  // Load existing profile from DB
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          const prefs = p.preferences || {};
          setProfile({
            ...p,
            college: p.college || prefs.college || '',
            phone_number: p.phone_number || prefs.phone_number || '',
            date_of_birth: p.date_of_birth || prefs.date_of_birth || '',
            gender: p.gender || prefs.gender || '',
            current_location: p.location || prefs.current_location || '',
            skills: p.skills || [],
            skill_gaps: p.skill_gaps || [],
            cgpa_scale: p.cgpa_scale || 10,
          });
        }
      }
    } catch {
      setError('Could not load profile. You can still fill it manually.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Save profile to API
  const persistProfile = async (dataToSave: ProfileData, shouldRedirect = false) => {
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to save profile. Please check the values.');
        return false;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (shouldRedirect) {
        router.push('/app');
        router.refresh();
      }
      return true;
    } catch {
      setError('Network error while saving profile.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 1) {
      if (!profile.full_name?.trim()) {
        setError('Please enter your full name.');
        return;
      }
    }

    await persistProfile(profile, false);

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 5 completed -> go to dashboard
      router.push('/app');
      router.refresh();
    }
  };

  const handleSaveAndExit = async () => {
    await persistProfile(profile, true);
  };

  // Skill management
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !(profile.skills || []).some(x => x.toLowerCase() === s.toLowerCase())) {
      setProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), s]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  // Handle resume file upload and auto-fill
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeLoading(true);
    setResumeNotice(null);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/profile/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to parse resume.');
        return;
      }

      const extracted = data.extracted || {};

      // Merge extracted fields into current profile state
      setProfile(prev => ({
        ...prev,
        full_name: extracted.full_name || prev.full_name,
        degree: extracted.degree || prev.degree,
        branch: extracted.branch || prev.branch,
        college: extracted.college || prev.college,
        academic_year: extracted.academic_year || prev.academic_year,
        cgpa: extracted.cgpa !== undefined ? extracted.cgpa : prev.cgpa,
        cgpa_scale: extracted.cgpa_scale || prev.cgpa_scale || 10,
        skills: Array.from(new Set([...(prev.skills || []), ...(extracted.skills || [])])),
        github_url: extracted.github_url || prev.github_url,
        portfolio_url: extracted.portfolio_url || prev.portfolio_url,
        current_location: extracted.location || prev.current_location,
        phone_number: extracted.phone || prev.phone_number,
      }));

      setResumeNotice('Resume parsed successfully! Extracted fields have been pre-filled for your review.');
    } catch {
      setError('An error occurred while uploading the resume.');
    } finally {
      setResumeLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const stepPercent = Math.round((currentStep / 5) * 100);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <div>
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555B64] hover:text-[#16233B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Header and Campus Banner (Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#16233B]">
            Let&apos;s set up your profile
          </h1>
          <p className="text-xs sm:text-sm text-[#555B64]">
            This helps us find the most relevant opportunities for you.
          </p>
        </div>

        {/* Top Header Campus Callout */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden p-5 text-white border border-[#E8E4DC] shadow-xs flex items-center min-h-[90px]">
          <Image
            src="/images/campus-sunset.jpg"
            alt="Campus walkway banner"
            fill
            priority
            sizes="400px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#16233B]/75 backdrop-blur-xs" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-[#A7F3D0] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-white/95 leading-relaxed">
              Complete your profile to get personalized recommendations and instant eligibility audits.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Navigation (Image 3) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E4DC] shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[560px]">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex items-center gap-2.5 text-xs font-medium group cursor-pointer focus:outline-none"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-[#16233B] text-white ring-4 ring-[#E9F0EB]'
                      : isCompleted
                      ? 'bg-[#2D5542] text-white'
                      : 'bg-[#F4EFEA] text-[#777D85] group-hover:bg-[#E8E4DC]'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  <span className={`transition-colors ${
                    isActive
                      ? 'text-[#16233B] font-semibold'
                      : isCompleted
                      ? 'text-[#2D5542]'
                      : 'text-[#777D85]'
                  }`}>
                    {step.label}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className="h-0.5 flex-1 mx-3 bg-[#E8E4DC]" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Resume Auto-Fill Prompt Bar */}
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E8E4DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#16233B]">Have a resume ready?</h4>
            <p className="text-[11px] text-[#555B64]">
              Upload your PDF or text resume to auto-fill the form fields in seconds.
            </p>
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleResumeUpload}
            accept=".pdf,.txt,.text,.md"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={resumeLoading}
            className="bg-white border-[#E8E4DC] text-xs h-9 rounded-xl font-medium flex items-center gap-1.5 shadow-xs"
          >
            {resumeLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Parsing resume...
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-[#2D5542]" />
                Auto-fill from Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {resumeNotice && (
        <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
          <span>{resumeNotice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
          <span>Profile changes saved successfully to your account.</span>
        </div>
      )}

      {/* Main Grid: Form Left (8 cols) + Right Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Container */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E4DC] shadow-xs space-y-6">
          {/* STEP 1: BASIC INFORMATION (Image 3) */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Basic Information
                </h2>
                <p className="text-xs text-[#777D85] mt-1">Tell us a bit about yourself.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="text-xs font-semibold text-[#20242B]">
                    Full Name <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="e.g. Shiva Kumar"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone_number" className="text-xs font-semibold text-[#20242B]">
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    value={profile.phone_number || ''}
                    onChange={(e) => setProfile(p => ({ ...p, phone_number: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date_of_birth" className="text-xs font-semibold text-[#20242B]">
                    Date of Birth
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile.date_of_birth || ''}
                    onChange={(e) => setProfile(p => ({ ...p, date_of_birth: e.target.value }))}
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-semibold text-[#20242B]">
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={profile.gender || ''}
                    onChange={(e) => setProfile(p => ({ ...p, gender: e.target.value }))}
                    className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B] focus:outline-none focus:ring-1 focus:ring-[#16233B]"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current_location" className="text-xs font-semibold text-[#20242B]">
                    Current Location
                  </Label>
                  <Input
                    id="current_location"
                    value={profile.current_location || ''}
                    onChange={(e) => setProfile(p => ({ ...p, current_location: e.target.value }))}
                    placeholder="e.g. Hyderabad, Telangana"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="college" className="text-xs font-semibold text-[#20242B]">
                    College / University
                  </Label>
                  <Input
                    id="college"
                    value={profile.college || ''}
                    onChange={(e) => setProfile(p => ({ ...p, college: e.target.value }))}
                    placeholder="e.g. IIIT Hyderabad"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="degree" className="text-xs font-semibold text-[#20242B]">
                    Degree Program
                  </Label>
                  <select
                    id="degree"
                    value={profile.degree || ''}
                    onChange={(e) => setProfile(p => ({ ...p, degree: e.target.value }))}
                    className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B] focus:outline-none focus:ring-1 focus:ring-[#16233B]"
                  >
                    <option value="">Select degree</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E.">B.E.</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="BCA">BCA</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch" className="text-xs font-semibold text-[#20242B]">
                    Branch / Major
                  </Label>
                  <Input
                    id="branch"
                    value={profile.branch || ''}
                    onChange={(e) => setProfile(p => ({ ...p, branch: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="academic_year" className="text-xs font-semibold text-[#20242B]">
                    Expected Graduation Year
                  </Label>
                  <select
                    id="academic_year"
                    value={profile.academic_year || ''}
                    onChange={(e) => setProfile(p => ({ ...p, academic_year: e.target.value }))}
                    className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B] focus:outline-none focus:ring-1 focus:ring-[#16233B]"
                  >
                    <option value="">Select year</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Academic Credentials
                </h2>
                <p className="text-xs text-[#777D85] mt-1">
                  Used by our deterministic eligibility engine to check CGPA cutoffs and percentages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cgpa" className="text-xs font-semibold text-[#20242B]">
                    CGPA / GPA
                  </Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max={profile.cgpa_scale || 10}
                    value={profile.cgpa ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, cgpa: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="e.g. 8.5"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cgpa_scale" className="text-xs font-semibold text-[#20242B]">
                    Scale (default 10)
                  </Label>
                  <Input
                    id="cgpa_scale"
                    type="number"
                    value={profile.cgpa_scale || 10}
                    onChange={(e) => setProfile(p => ({ ...p, cgpa_scale: Number(e.target.value) }))}
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="marks_percentage" className="text-xs font-semibold text-[#20242B]">
                    10th / 12th / Degree Marks Percentage (%)
                  </Label>
                  <Input
                    id="marks_percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={profile.marks_percentage ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, marks_percentage: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="e.g. 88.5"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="annual_income" className="text-xs font-semibold text-[#20242B]">
                    Annual Family Income (₹) <span className="text-[#777D85] font-normal">(for scholarships)</span>
                  </Label>
                  <Input
                    id="annual_income"
                    type="number"
                    value={profile.annual_income ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, annual_income: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="e.g. 450000"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Opportunity Preferences
                </h2>
                <p className="text-xs text-[#777D85] mt-1">
                  Specify availability and work preferences to filter relevant opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="availability_weeks" className="text-xs font-semibold text-[#20242B]">
                    Availability for Internship (Weeks)
                  </Label>
                  <Input
                    id="availability_weeks"
                    type="number"
                    min="1"
                    max="52"
                    value={profile.availability_weeks ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, availability_weeks: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="e.g. 8 weeks"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="work_authorization" className="text-xs font-semibold text-[#20242B]">
                    Work Authorization in India
                  </Label>
                  <select
                    id="work_authorization"
                    value={profile.work_authorization === true ? 'yes' : profile.work_authorization === false ? 'no' : ''}
                    onChange={(e) => setProfile(p => ({ ...p, work_authorization: e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null }))}
                    className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B] focus:outline-none focus:ring-1 focus:ring-[#16233B]"
                  >
                    <option value="">Select authorization</option>
                    <option value="yes">Yes, citizen / authorized to work</option>
                    <option value="no">No, requires visa sponsorship</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="team_size" className="text-xs font-semibold text-[#20242B]">
                  Hackathon / Competition Preferred Team Size
                </Label>
                <Input
                  id="team_size"
                  type="number"
                  min="1"
                  max="10"
                  value={profile.team_size ?? ''}
                  onChange={(e) => setProfile(p => ({ ...p, team_size: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="e.g. 4 members"
                  className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: SKILLS & INTERESTS */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Skills, Links & Profiles
                </h2>
                <p className="text-xs text-[#777D85] mt-1">
                  Add technical skills you have verified experience with. Missing skills will be flagged honestly as MISSING INFO.
                </p>
              </div>

              {/* Skills Tag Adder */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-[#20242B]">
                  Your Technical Skills
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. Python, React, PostgreSQL, PyTorch"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    className="bg-[#FAF9F5] border-[#E8E4DC] hover:bg-[#F2ECE3] h-10 px-4 rounded-xl text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>

                {/* Display Tags */}
                <div className="flex flex-wrap gap-2 pt-1 min-h-[48px] p-3 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC]">
                  {(profile.skills || []).length === 0 ? (
                    <span className="text-xs text-[#999DA3] italic">No skills added yet. Type a skill and click Add.</span>
                  ) : (
                    profile.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E9F0EB] text-[#2D5542] border border-[#D5E4D8]"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-[#DC2626] transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* GitHub and Portfolio URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="github_url" className="text-xs font-semibold text-[#20242B]">
                    GitHub Profile URL
                  </Label>
                  <Input
                    id="github_url"
                    type="url"
                    value={profile.github_url || ''}
                    onChange={(e) => setProfile(p => ({ ...p, github_url: e.target.value }))}
                    placeholder="https://github.com/username"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="portfolio_url" className="text-xs font-semibold text-[#20242B]">
                    Portfolio / Website URL
                  </Label>
                  <Input
                    id="portfolio_url"
                    type="url"
                    value={profile.portfolio_url || ''}
                    onChange={(e) => setProfile(p => ({ ...p, portfolio_url: e.target.value }))}
                    placeholder="https://yourportfolio.dev"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Review Your Profile
                </h2>
                <p className="text-xs text-[#777D85] mt-1">
                  Ensure your information is accurate. You can update it anytime from this page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-1.5">
                  <p className="font-semibold text-[#16233B]">Full Name</p>
                  <p className="text-[#555B64]">{profile.full_name || 'Not provided'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-1.5">
                  <p className="font-semibold text-[#16233B]">College / University</p>
                  <p className="text-[#555B64]">{profile.college || 'Not provided'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-1.5">
                  <p className="font-semibold text-[#16233B]">Degree & Branch</p>
                  <p className="text-[#555B64]">{profile.degree || 'Degree'} in {profile.branch || 'Branch'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-1.5">
                  <p className="font-semibold text-[#16233B]">Academic Standing</p>
                  <p className="text-[#555B64]">CGPA: {profile.cgpa ?? '—'} / {profile.cgpa_scale || 10} · Year: {profile.academic_year || '—'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-2">
                <p className="text-xs font-semibold text-[#16233B]">Skills ({profile.skills?.length || 0})</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills?.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E9F0EB] text-[#2D5542]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Buttons (Image 3) */}
          <div className="flex items-center justify-between pt-6 border-t border-[#F0ECE4]">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAndExit}
              disabled={saving}
              className="bg-white border-[#E8E4DC] text-[#20242B] text-xs h-10 px-5 rounded-xl font-medium shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save & Exit
            </Button>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-xs font-medium text-[#555B64] hover:text-[#16233B] h-10 px-4"
                >
                  Previous
                </Button>
              )}

              <Button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="bg-[#16233B] hover:bg-[#20314F] text-white text-xs h-10 px-6 rounded-xl font-medium shadow-sm flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                <span>
                  {currentStep === 1
                    ? 'Next: Education →'
                    : currentStep === 2
                    ? 'Next: Preferences →'
                    : currentStep === 3
                    ? 'Next: Skills & Interests →'
                    : currentStep === 4
                    ? 'Next: Review →'
                    : 'Save & Complete Profile ✓'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: "Why this matters?", Completion Bar & Tips (Image 3) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Why this matters Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E4DC] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#16233B]">
              Why this matters?
            </h3>
            <p className="text-xs text-[#777D85]">Your profile helps OpportunityKit:</p>

            <div className="space-y-3 pt-1">
              {[
                { icon: Shield, text: "Find opportunities you're actually eligible for" },
                { icon: Sparkles, text: "Give personalized recommendations" },
                { icon: Calendar, text: "Track application deadlines" },
                { icon: Briefcase, text: "Show relevant skill-building suggestions" },
                { icon: Compass, text: "Help you stay organized in one place" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#555B64]">
                  <div className="w-5 h-5 rounded-md bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-3 h-3" />
                  </div>
                  <span className="leading-snug">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E4DC] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#16233B]">Profile Completion</span>
              <span className="text-[#2D5542]">{currentStep} of 5 steps ({stepPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-[#F4EFEA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2D5542] rounded-full transition-all duration-300"
                style={{ width: `${stepPercent}%` }}
              />
            </div>
          </div>

          {/* Tip Callout */}
          <div className="p-4 rounded-2xl bg-[#E9F0EB]/60 border border-[#D5E4D8] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D5542]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tip</span>
            </div>
            <p className="text-[11px] text-[#2D5542] leading-relaxed">
              The more accurate your information, the better and more relevant opportunities and audit results you&apos;ll get.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

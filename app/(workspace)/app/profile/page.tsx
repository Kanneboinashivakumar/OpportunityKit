'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, ArrowRight, Save, CheckCircle2, AlertCircle, Loader2,
  Upload, FileText, Check, Plus, X, Sparkles, HelpCircle,
  Briefcase, GraduationCap, Calendar, Compass, Shield,
  Edit3, ExternalLink, Globe, Link2, MapPin, User, Mail, Phone,
  Award, Code, CheckSquare
} from 'lucide-react';

export interface ProfileData {
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
  // 10th & 12th Education
  tenth_school?: string;
  tenth_percentage?: number | null;
  twelfth_school?: string;
  twelfth_percentage?: number | null;
  cgpa?: number | null;
  cgpa_scale?: number;
  annual_income?: number | null;
  // Preferences
  preferred_location?: string;
  availability_weeks?: number | null;
  work_authorization?: boolean | null;
  hackathon_interest?: boolean | null;
  team_size?: number | null;
  hackathon_role?: string;
  // Skills & Links
  skills?: string[];
  skill_gaps?: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  location?: string;
  preferences?: Record<string, unknown>;
}

const STEPS = [
  { id: 1, label: 'Basic Information' },
  { id: 2, label: 'Education' },
  { id: 3, label: 'Preferences' },
  { id: 4, label: 'Skills & Links' },
  { id: 5, label: 'Review' },
];

const POPULAR_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'SQL', 'PostgreSQL', 'Docker', 'Git', 'Tailwind CSS', 'Java', 'C++',
  'Machine Learning', 'Data Structures', 'REST APIs', 'MongoDB'
];

const POPULAR_LOCATIONS = [
  'Pan India / Any', 'Remote Only', 'Hyderabad', 'Bangalore', 'Pune',
  'Delhi NCR', 'Mumbai', 'Chennai', 'Kolkata'
];

const HACKATHON_ROLES = [
  'Full Stack Engineer', 'Frontend Developer', 'Backend Developer',
  'AI / ML Engineer', 'UI/UX Designer', 'Mobile App Developer', 'Data Scientist'
];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
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
          const loadedProfile: ProfileData = {
            ...p,
            college: p.college || prefs.college || '',
            phone_number: p.phone_number || prefs.phone_number || '',
            date_of_birth: p.date_of_birth || prefs.date_of_birth || '',
            gender: p.gender || prefs.gender || '',
            current_location: p.location || prefs.current_location || '',
            tenth_school: prefs.tenth_school || p.tenth_school || '',
            tenth_percentage: prefs.tenth_percentage ?? p.tenth_percentage ?? null,
            twelfth_school: prefs.twelfth_school || p.twelfth_school || '',
            twelfth_percentage: prefs.twelfth_percentage ?? p.twelfth_percentage ?? null,
            preferred_location: prefs.preferred_location || p.preferred_location || '',
            hackathon_interest: prefs.hackathon_interest ?? p.hackathon_interest ?? true,
            team_size: p.team_size ?? prefs.team_size ?? 4,
            hackathon_role: prefs.hackathon_role || p.hackathon_role || '',
            linkedin_url: prefs.linkedin_url || p.linkedin_url || '',
            skills: p.skills || [],
            skill_gaps: p.skill_gaps || [],
            cgpa_scale: p.cgpa_scale || 10,
          };
          setProfile(loadedProfile);

          // If user already has basic name & cgpa/skills, default to View Mode
          if (loadedProfile.full_name && (loadedProfile.cgpa !== null || (loadedProfile.skills && loadedProfile.skills.length > 0))) {
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        } else {
          setIsEditing(true);
        }
      }
    } catch {
      setError('Could not load profile. You can still fill it manually.');
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Save profile to API
  const persistProfile = async (dataToSave: ProfileData, switchView = false) => {
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dataToSave,
          location: dataToSave.current_location || dataToSave.location || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to save profile. Please check the values.');
        return false;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (switchView) {
        setIsEditing(false);
      }
      return true;
    } catch {
      setError('Network error while saving profile.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Step 1 validation: all 9 basic fields required
  const validateStep1 = (): boolean => {
    if (!profile.full_name?.trim()) {
      setError('Full Name is required.');
      return false;
    }
    if (!profile.phone_number?.trim()) {
      setError('Phone Number is required.');
      return false;
    }
    if (!profile.date_of_birth?.trim()) {
      setError('Date of Birth is required.');
      return false;
    }
    if (!profile.gender?.trim()) {
      setError('Gender is required.');
      return false;
    }
    if (!profile.current_location?.trim()) {
      setError('Current Location is required.');
      return false;
    }
    if (!profile.college?.trim()) {
      setError('College / University is required.');
      return false;
    }
    if (!profile.degree?.trim()) {
      setError('Degree Program is required.');
      return false;
    }
    if (!profile.branch?.trim()) {
      setError('Branch / Major is required.');
      return false;
    }
    if (!profile.academic_year?.trim()) {
      setError('Graduation Year is required.');
      return false;
    }
    return true;
  };

  // Step 2 validation: 10th, 12th & CGPA required
  const validateStep2 = (): boolean => {
    if (!profile.tenth_school?.trim()) {
      setError('10th School / Board campus name is required.');
      return false;
    }
    if (profile.tenth_percentage === null || profile.tenth_percentage === undefined || isNaN(profile.tenth_percentage)) {
      setError('10th Marks Percentage (%) is required.');
      return false;
    }
    if (!profile.twelfth_school?.trim()) {
      setError('12th College / Junior College campus name is required.');
      return false;
    }
    if (profile.twelfth_percentage === null || profile.twelfth_percentage === undefined || isNaN(profile.twelfth_percentage)) {
      setError('12th Marks Percentage (%) is required.');
      return false;
    }
    if (profile.cgpa === null || profile.cgpa === undefined || isNaN(profile.cgpa)) {
      setError('College CGPA / GPA is required.');
      return false;
    }
    return true;
  };

  // Step 4 validation: GitHub URL and at least 1 skill required
  const validateStep4 = (): boolean => {
    if (!profile.skills || profile.skills.length === 0) {
      setError('Please add at least one technical skill.');
      return false;
    }
    if (!profile.github_url?.trim()) {
      setError('GitHub Profile URL is mandatory.');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    setError('');

    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 4 && !validateStep4()) return;

    await persistProfile(profile, false);

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 5 completed -> save and switch to View Mode
      await persistProfile(profile, true);
    }
  };

  const handleSaveAndExit = async () => {
    await persistProfile(profile, true);
  };

  // Skill management
  const addSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || newSkill).trim();
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
      let extractedText = '';
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isText = file.type.startsWith('text/') || /\.(txt|md|text)$/i.test(file.name);

      if (isPdf) {
        try {
          const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
            import.meta.url
          ).toString();

          const pdf = await pdfjs.getDocument({
            data: new Uint8Array(await file.arrayBuffer()),
            isEvalSupported: false,
          }).promise;

          const pages: string[] = [];
          for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 10); pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            pages.push(textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' '));
          }
          extractedText = pages.join('\n\n').trim();
        } catch (pdfErr) {
          console.error('Client PDF parse error:', pdfErr);
        }
      } else if (isText) {
        extractedText = await file.text();
      }

      if (isPdf && (!extractedText || extractedText.length < 30)) {
        setError('Could not extract selectable text from this PDF (it may be a scanned image). Please paste your details or fill the form manually.');
        setResumeLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('resume', file);
      if (extractedText) {
        formData.append('text', extractedText);
      }

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

      const isClean = (v?: string | null) => {
        if (!v) return false;
        const s = v.trim().toLowerCase();
        return s !== '' && s !== 'unknown' && s !== 'n/a' && s !== 'null' && s !== 'none';
      };

      // Normalize degree
      let normalizedDegree = isClean(extracted.degree) ? extracted.degree.trim() : '';
      if (normalizedDegree) {
        const dLow = normalizedDegree.toLowerCase();
        if (dLow.includes('b.tech') || dLow.includes('btech') || dLow.includes('bachelor of technology')) {
          normalizedDegree = 'B.Tech';
        } else if (dLow.includes('b.e') || dLow.includes('be') || dLow.includes('bachelor of engineering')) {
          normalizedDegree = 'B.E.';
        } else if (dLow.includes('b.sc') || dLow.includes('bsc') || dLow.includes('bachelor of science')) {
          normalizedDegree = 'B.Sc';
        } else if (dLow.includes('bca') || dLow.includes('bachelor of computer applications')) {
          normalizedDegree = 'BCA';
        } else if (dLow.includes('m.tech') || dLow.includes('mtech') || dLow.includes('master of technology')) {
          normalizedDegree = 'M.Tech';
        } else if (dLow.includes('mca') || dLow.includes('master of computer applications')) {
          normalizedDegree = 'MCA';
        }
      }

      // Normalize academic year
      let normalizedYear = isClean(extracted.academic_year) ? extracted.academic_year.trim() : '';
      if (normalizedYear) {
        const yearMatch = normalizedYear.match(/\b(202[0-9]|203[0-9])\b/);
        if (yearMatch) {
          normalizedYear = yearMatch[1];
        }
      }

      // Merge extracted fields into current profile state
      setProfile(prev => ({
        ...prev,
        full_name: isClean(extracted.full_name) ? extracted.full_name.trim() : prev.full_name,
        degree: normalizedDegree || prev.degree,
        branch: isClean(extracted.branch) ? extracted.branch.trim() : prev.branch,
        college: isClean(extracted.college) ? extracted.college.trim() : prev.college,
        academic_year: normalizedYear || prev.academic_year,
        cgpa: typeof extracted.cgpa === 'number' && !isNaN(extracted.cgpa) ? extracted.cgpa : prev.cgpa,
        cgpa_scale: typeof extracted.cgpa_scale === 'number' && extracted.cgpa_scale > 0 ? extracted.cgpa_scale : prev.cgpa_scale || 10,
        skills: Array.from(new Set([...(prev.skills || []), ...(Array.isArray(extracted.skills) ? extracted.skills.filter(isClean) : [])])),
        github_url: isClean(extracted.github_url) ? extracted.github_url.trim() : prev.github_url,
        portfolio_url: isClean(extracted.portfolio_url) ? extracted.portfolio_url.trim() : prev.portfolio_url,
        current_location: isClean(extracted.location) ? extracted.location.trim() : prev.current_location,
        phone_number: isClean(extracted.phone) ? extracted.phone.trim() : prev.phone_number,
      }));

      // Switch to edit mode so user sees and confirms the auto-filled values
      setIsEditing(true);

      const filledSummary: string[] = [];
      if (isClean(extracted.full_name)) filledSummary.push(`Name (${extracted.full_name.trim()})`);
      if (isClean(extracted.college)) filledSummary.push('College');
      if (normalizedDegree) filledSummary.push(`Degree (${normalizedDegree})`);
      if (isClean(extracted.branch)) filledSummary.push('Branch');
      if (typeof extracted.cgpa === 'number') filledSummary.push(`CGPA (${extracted.cgpa})`);
      if (Array.isArray(extracted.skills) && extracted.skills.length > 0) filledSummary.push(`${extracted.skills.length} skills`);

      if (filledSummary.length > 0) {
        setResumeNotice(`Resume parsed successfully! Auto-filled: ${filledSummary.join(', ')}. Review below and proceed.`);
      } else {
        setResumeNotice('Resume parsed. Some details were not detected — please verify the form fields.');
      }
    } catch (err: any) {
      console.error('Resume upload error:', err);
      setError('An error occurred while uploading or parsing the resume.');
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

  // ==========================================
  // VIEW MODE: "Real SaaS App" Full Profile
  // ==========================================
  if (!isEditing && profile.full_name) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555B64] hover:text-[#16233B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleResumeUpload}
              accept=".pdf,.docx,.txt,.text,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                  <Upload className="w-3.5 h-3.5 text-[#2D5542]" />
                  Re-parse from Resume
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setIsEditing(true);
                setCurrentStep(1);
              }}
              className="bg-[#16233B] hover:bg-[#20314F] text-white text-xs h-9 px-4 rounded-xl font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Executive Header Banner */}
        <div className="bg-white rounded-3xl border border-[#E8E4DC] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#16233B] text-white flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-sm">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#16233B]">
                    {profile.full_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E9F0EB] text-[#2D5542] border border-[#C6DEC9]">
                    <CheckCircle2 className="w-3 h-3 text-[#2D5542]" /> Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#555B64] font-medium">
                  {profile.degree || 'Degree'} in {profile.branch || 'Branch'} · {profile.college || 'College'}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#777D85] pt-0.5 flex-wrap">
                  {profile.current_location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#999DA3]" />
                      {profile.current_location}
                    </span>
                  )}
                  {profile.academic_year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#999DA3]" />
                      Class of {profile.academic_year}
                    </span>
                  )}
                  {profile.cgpa !== null && profile.cgpa !== undefined && (
                    <span className="flex items-center gap-1 font-semibold text-[#2D5542]">
                      <Award className="w-3.5 h-3.5" />
                      CGPA: {profile.cgpa} / {profile.cgpa_scale || 10}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
              <Button
                onClick={() => {
                  setIsEditing(true);
                  setCurrentStep(1);
                }}
                className="w-full sm:w-auto bg-[#16233B] hover:bg-[#20314F] text-white text-xs h-9 px-5 rounded-xl font-semibold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile Details
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Rich Profile Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <h3 className="font-serif text-base font-semibold text-[#16233B] flex items-center gap-2">
                <User className="w-4 h-4 text-[#2D5542]" /> Basic Information
              </h3>
              <button
                onClick={() => { setIsEditing(true); setCurrentStep(1); }}
                className="text-xs font-semibold text-[#2D5542] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[#777D85] font-medium">Full Name</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.full_name}</p>
              </div>
              <div>
                <p className="text-[#777D85] font-medium">Phone Number</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.phone_number || '—'}</p>
              </div>
              <div>
                <p className="text-[#777D85] font-medium">Date of Birth</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.date_of_birth || '—'}</p>
              </div>
              <div>
                <p className="text-[#777D85] font-medium">Gender</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.gender || '—'}</p>
              </div>
              <div>
                <p className="text-[#777D85] font-medium">Current Location</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.current_location || '—'}</p>
              </div>
              <div>
                <p className="text-[#777D85] font-medium">Expected Graduation</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.academic_year || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#777D85] font-medium">College / University</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.college || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#777D85] font-medium">Program & Branch</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.degree || 'Degree'} in {profile.branch || 'Branch'}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Academic & Schooling Records */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <h3 className="font-serif text-base font-semibold text-[#16233B] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#2D5542]" /> Academic Credentials
              </h3>
              <button
                onClick={() => { setIsEditing(true); setCurrentStep(2); }}
                className="text-xs font-semibold text-[#2D5542] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* College CGPA */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-between">
                <div>
                  <p className="text-[#777D85] font-medium">College CGPA / GPA</p>
                  <p className="font-semibold text-[#16233B] mt-0.5">Scale of {profile.cgpa_scale || 10}</p>
                </div>
                <span className="text-base font-bold text-[#2D5542]">
                  {profile.cgpa ?? '—'} / {profile.cgpa_scale || 10}
                </span>
              </div>

              {/* 10th Record */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-between">
                <div>
                  <p className="text-[#777D85] font-medium">10th Standard (Secondary)</p>
                  <p className="font-semibold text-[#16233B] mt-0.5 truncate max-w-[200px]">{profile.tenth_school || 'School name not added'}</p>
                </div>
                <span className="font-bold text-[#16233B]">
                  {profile.tenth_percentage !== null && profile.tenth_percentage !== undefined ? `${profile.tenth_percentage}%` : '—'}
                </span>
              </div>

              {/* 12th Record */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-between">
                <div>
                  <p className="text-[#777D85] font-medium">12th Standard / Diploma</p>
                  <p className="font-semibold text-[#16233B] mt-0.5 truncate max-w-[200px]">{profile.twelfth_school || 'Junior college not added'}</p>
                </div>
                <span className="font-bold text-[#16233B]">
                  {profile.twelfth_percentage !== null && profile.twelfth_percentage !== undefined ? `${profile.twelfth_percentage}%` : '—'}
                </span>
              </div>

              {/* Family Income */}
              {profile.annual_income && (
                <div className="pt-1 flex items-center justify-between text-[#777D85]">
                  <span>Annual Family Income</span>
                  <span className="font-semibold text-[#16233B]">₹{Number(profile.annual_income).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Opportunity & Hackathon Preferences */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <h3 className="font-serif text-base font-semibold text-[#16233B] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2D5542]" /> Opportunity Preferences
              </h3>
              <button
                onClick={() => { setIsEditing(true); setCurrentStep(3); }}
                className="text-xs font-semibold text-[#2D5542] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[#777D85] font-medium">Preferred Work Location</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.preferred_location || 'Pan India / Any'}</p>
              </div>
              <div>
                <p className="text-[#777D85] font-medium">Internship Availability</p>
                <p className="font-semibold text-[#16233B] mt-0.5">
                  {profile.availability_weeks ? `${profile.availability_weeks} weeks (~${Math.round(profile.availability_weeks / 4.33)} months)` : 'Flexible'}
                </p>
              </div>
              <div>
                <p className="text-[#777D85] font-medium">Open to Hackathons?</p>
                <p className="font-semibold text-[#16233B] mt-0.5">
                  {profile.hackathon_interest !== false ? 'Yes, interested' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-[#777D85] font-medium">Preferred Team Size</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.team_size ? `${profile.team_size} members` : '4 members'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#777D85] font-medium">Hackathon Role / Specialization</p>
                <p className="font-semibold text-[#16233B] mt-0.5">{profile.hackathon_role || 'Full Stack Engineer'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#777D85] font-medium">Work Authorization</p>
                <p className="font-semibold text-[#16233B] mt-0.5">
                  {profile.work_authorization !== false ? 'Authorized to work in India (Citizen)' : 'Requires Visa Sponsorship'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Verified Skills, Links & Profiles */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E4DC] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <h3 className="font-serif text-base font-semibold text-[#16233B] flex items-center gap-2">
                <Code className="w-4 h-4 text-[#2D5542]" /> Skills & Profiles
              </h3>
              <button
                onClick={() => { setIsEditing(true); setCurrentStep(4); }}
                className="text-xs font-semibold text-[#2D5542] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            {/* Links */}
            <div className="space-y-2 text-xs">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] hover:border-[#16233B] transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-[#16233B]">GitHub</span>
                    <span className="text-[#777D85] truncate max-w-[200px]">{profile.github_url}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#555B64] shrink-0" />
                </a>
              )}

              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] hover:border-[#0A66C2] transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-[#0A66C2]">LinkedIn</span>
                    <span className="text-[#777D85] truncate max-w-[200px]">{profile.linkedin_url}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#555B64] shrink-0" />
                </a>
              )}

              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] hover:border-[#2D5542] transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-[#2D5542]">Portfolio</span>
                    <span className="text-[#777D85] truncate max-w-[200px]">{profile.portfolio_url}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#555B64] shrink-0" />
                </a>
              )}
            </div>

            {/* Technical Skills Pills */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold text-[#16233B]">
                Verified Skills ({profile.skills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {profile.skills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#E9F0EB] text-[#2D5542] border border-[#D5E4D8]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // EDIT MODE: 5-Step Guided Wizard
  // ==========================================
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Back Link or Cancel Edit */}
      <div className="flex items-center justify-between">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555B64] hover:text-[#16233B] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {profile.full_name && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="text-xs text-[#555B64] hover:text-[#16233B]"
          >
            ← Back to Profile View
          </Button>
        )}
      </div>

      {/* Header and Campus Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 space-y-1">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#16233B]">
            {profile.full_name ? 'Edit your profile details' : "Let's set up your profile"}
          </h1>
          <p className="text-xs sm:text-sm text-[#555B64]">
            This information powers our deterministic eligibility engine and matches you with verified opportunities.
          </p>
        </div>

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
              Required fields are marked with a red star (<span className="text-[#F87171] font-bold">*</span>) and are evaluated during eligibility checks.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
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
              Upload your PDF, DOCX, or text resume to auto-fill these form fields in seconds.
            </p>
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleResumeUpload}
            accept=".pdf,.docx,.txt,.text,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
          {/* STEP 1: BASIC INFORMATION (ALL MANDATORY *) */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Basic Information
                </h2>
                <p className="text-xs text-[#777D85] mt-1">All fields are mandatory for identity and academic eligibility.</p>
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
                    Phone Number <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="phone_number"
                    value={profile.phone_number || ''}
                    onChange={(e) => setProfile(p => ({ ...p, phone_number: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date_of_birth" className="text-xs font-semibold text-[#20242B]">
                    Date of Birth <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile.date_of_birth || ''}
                    onChange={(e) => setProfile(p => ({ ...p, date_of_birth: e.target.value }))}
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-semibold text-[#20242B]">
                    Gender <span className="text-[#DC2626]">*</span>
                  </Label>
                  <select
                    id="gender"
                    value={profile.gender || ''}
                    onChange={(e) => setProfile(p => ({ ...p, gender: e.target.value }))}
                    className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B] focus:outline-none focus:ring-1 focus:ring-[#16233B]"
                    required
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
                    Current Location / City <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="current_location"
                    value={profile.current_location || ''}
                    onChange={(e) => setProfile(p => ({ ...p, current_location: e.target.value }))}
                    placeholder="e.g. Hyderabad, Telangana"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="college" className="text-xs font-semibold text-[#20242B]">
                    College / University <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="college"
                    value={profile.college || ''}
                    onChange={(e) => setProfile(p => ({ ...p, college: e.target.value }))}
                    placeholder="e.g. IIIT Hyderabad"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="degree" className="text-xs font-semibold text-[#20242B]">
                    Degree Program <span className="text-[#DC2626]">*</span>
                  </Label>
                  <select
                    id="degree"
                    value={profile.degree || ''}
                    onChange={(e) => setProfile(p => ({ ...p, degree: e.target.value }))}
                    className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B] focus:outline-none focus:ring-1 focus:ring-[#16233B]"
                    required
                  >
                    <option value="">Select degree</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E.">B.E.</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="BCA">BCA</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="Other">Other</option>
                    {profile.degree && !['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'M.Tech', 'MCA', 'Other'].includes(profile.degree) && (
                      <option value={profile.degree}>{profile.degree}</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch" className="text-xs font-semibold text-[#20242B]">
                    Branch / Major <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="branch"
                    value={profile.branch || ''}
                    onChange={(e) => setProfile(p => ({ ...p, branch: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="academic_year" className="text-xs font-semibold text-[#20242B]">
                    Graduation Year <span className="text-[#DC2626]">*</span>
                  </Label>
                  <select
                    id="academic_year"
                    value={profile.academic_year || ''}
                    onChange={(e) => setProfile(p => ({ ...p, academic_year: e.target.value }))}
                    className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B] focus:outline-none focus:ring-1 focus:ring-[#16233B]"
                    required
                  >
                    <option value="">Select year</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                    <option value="2030">2030</option>
                    {profile.academic_year && !['2024', '2025', '2026', '2027', '2028', '2029', '2030'].includes(profile.academic_year) && (
                      <option value={profile.academic_year}>{profile.academic_year}</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION (10TH, 12TH SEPARATE WITH CAMPUS NAMES + OPTIONAL INCOME) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Education & Academic Credentials
                </h2>
                <p className="text-xs text-[#777D85] mt-1">
                  Provide separate details for 10th, 12th, and college standing. Annual income is optional.
                </p>
              </div>

              {/* 10th Standard Group */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-3">
                <h3 className="font-semibold text-xs sm:text-sm text-[#16233B] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#2D5542]" /> 10th Standard (Secondary Board)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="tenth_school" className="text-xs font-semibold text-[#20242B]">
                      10th School / Board Campus Name <span className="text-[#DC2626]">*</span>
                    </Label>
                    <Input
                      id="tenth_school"
                      value={profile.tenth_school || ''}
                      onChange={(e) => setProfile(p => ({ ...p, tenth_school: e.target.value }))}
                      placeholder="e.g. Delhi Public School / CBSE"
                      className="h-10 text-xs rounded-xl bg-white border-[#E8E4DC]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tenth_percentage" className="text-xs font-semibold text-[#20242B]">
                      10th Marks (%) <span className="text-[#DC2626]">*</span>
                    </Label>
                    <Input
                      id="tenth_percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={profile.tenth_percentage ?? ''}
                      onChange={(e) => setProfile(p => ({ ...p, tenth_percentage: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="e.g. 92.4"
                      className="h-10 text-xs rounded-xl bg-white border-[#E8E4DC]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 12th Standard Group */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-3">
                <h3 className="font-semibold text-xs sm:text-sm text-[#16233B] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#2D5542]" /> 12th Standard / Junior College / Diploma
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="twelfth_school" className="text-xs font-semibold text-[#20242B]">
                      12th College / Campus Name <span className="text-[#DC2626]">*</span>
                    </Label>
                    <Input
                      id="twelfth_school"
                      value={profile.twelfth_school || ''}
                      onChange={(e) => setProfile(p => ({ ...p, twelfth_school: e.target.value }))}
                      placeholder="e.g. Sri Chaitanya Junior College / State Board"
                      className="h-10 text-xs rounded-xl bg-white border-[#E8E4DC]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="twelfth_percentage" className="text-xs font-semibold text-[#20242B]">
                      12th Marks (%) <span className="text-[#DC2626]">*</span>
                    </Label>
                    <Input
                      id="twelfth_percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={profile.twelfth_percentage ?? ''}
                      onChange={(e) => setProfile(p => ({ ...p, twelfth_percentage: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="e.g. 89.6"
                      className="h-10 text-xs rounded-xl bg-white border-[#E8E4DC]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* College CGPA Group */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-3">
                <h3 className="font-semibold text-xs sm:text-sm text-[#16233B] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#2D5542]" /> University CGPA Standing
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cgpa" className="text-xs font-semibold text-[#20242B]">
                      Current CGPA / GPA <span className="text-[#DC2626]">*</span>
                    </Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max={profile.cgpa_scale || 10}
                      value={profile.cgpa ?? ''}
                      onChange={(e) => setProfile(p => ({ ...p, cgpa: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="e.g. 8.65"
                      className="h-10 text-xs rounded-xl bg-white border-[#E8E4DC]"
                      required
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
                      className="h-10 text-xs rounded-xl bg-white border-[#E8E4DC]"
                    />
                  </div>
                </div>
              </div>

              {/* Annual Income (OPTIONAL) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="annual_income" className="text-xs font-semibold text-[#20242B]">
                    Annual Family Income (₹)
                  </Label>
                  <span className="text-[11px] text-[#777D85]">Optional — used only for scholarships & grants</span>
                </div>
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
          )}

          {/* STEP 3: OPPORTUNITY PREFERENCES (LOCATION, HACKATHONS, AVAILABILITY) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Opportunity & Hackathon Preferences
                </h2>
                <p className="text-xs text-[#777D85] mt-1">
                  Specify your preferred location, hackathon team interests, and internship duration.
                </p>
              </div>

              {/* Preferred Location with Quick Chips */}
              <div className="space-y-2.5">
                <Label htmlFor="preferred_location" className="text-xs font-semibold text-[#20242B]">
                  Preferred Internship / Job Location
                </Label>
                <Input
                  id="preferred_location"
                  value={profile.preferred_location || ''}
                  onChange={(e) => setProfile(p => ({ ...p, preferred_location: e.target.value }))}
                  placeholder="e.g. Pan India, Hyderabad, Bangalore, or Remote"
                  className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setProfile(p => ({ ...p, preferred_location: loc }))}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                        profile.preferred_location === loc
                          ? 'bg-[#16233B] text-white border-[#16233B]'
                          : 'bg-[#FAF9F5] text-[#555B64] border-[#E8E4DC] hover:bg-[#F2ECE3]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internship Availability (Weeks) with Quick Select */}
              <div className="space-y-2.5">
                <Label htmlFor="availability_weeks" className="text-xs font-semibold text-[#20242B]">
                  Internship Duration Availability (in Weeks)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    id="availability_weeks"
                    type="number"
                    min="1"
                    max="52"
                    value={profile.availability_weeks ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, availability_weeks: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="e.g. 24 weeks (~6 months)"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                  />
                  <div className="sm:col-span-2 flex items-center gap-1.5 flex-wrap">
                    {[
                      { label: '2 Months (8w)', weeks: 8 },
                      { label: '3 Months (12w)', weeks: 12 },
                      { label: '4 Months (16w)', weeks: 16 },
                      { label: '6 Months (24w)', weeks: 24 },
                      { label: 'Full Time (52w)', weeks: 52 },
                    ].map((opt) => (
                      <button
                        key={opt.weeks}
                        type="button"
                        onClick={() => setProfile(p => ({ ...p, availability_weeks: opt.weeks }))}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
                          profile.availability_weeks === opt.weeks
                            ? 'bg-[#2D5542] text-white border-[#2D5542]'
                            : 'bg-[#FAF9F5] text-[#555B64] border-[#E8E4DC] hover:bg-[#F2ECE3]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hackathons & Competitions */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-[#16233B]">
                      Hackathons & Coding Competitions
                    </h3>
                    <p className="text-[11px] text-[#777D85]">Are you open to team competitions, hackathons, and challenges?</p>
                  </div>
                  <select
                    value={profile.hackathon_interest !== false ? 'yes' : 'no'}
                    onChange={(e) => setProfile(p => ({ ...p, hackathon_interest: e.target.value === 'yes' }))}
                    className="h-9 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B]"
                  >
                    <option value="yes">Yes, interested</option>
                    <option value="no">Not at this time</option>
                  </select>
                </div>

                {profile.hackathon_interest !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E8E4DC]">
                    <div className="space-y-1.5">
                      <Label htmlFor="team_size" className="text-xs font-semibold text-[#20242B]">
                        Preferred Team Size
                      </Label>
                      <select
                        id="team_size"
                        value={profile.team_size || 4}
                        onChange={(e) => setProfile(p => ({ ...p, team_size: Number(e.target.value) }))}
                        className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B]"
                      >
                        <option value="1">1 member (Solo)</option>
                        <option value="2">2 members (Duo)</option>
                        <option value="3">3 members</option>
                        <option value="4">4 members (Standard)</option>
                        <option value="5">5+ members</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="hackathon_role" className="text-xs font-semibold text-[#20242B]">
                        Primary Role in Team
                      </Label>
                      <select
                        id="hackathon_role"
                        value={profile.hackathon_role || ''}
                        onChange={(e) => setProfile(p => ({ ...p, hackathon_role: e.target.value }))}
                        className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B]"
                      >
                        <option value="">Select primary role</option>
                        {HACKATHON_ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Work Authorization */}
              <div className="space-y-1.5">
                <Label htmlFor="work_authorization" className="text-xs font-semibold text-[#20242B]">
                  Work Authorization in India
                </Label>
                <select
                  id="work_authorization"
                  value={profile.work_authorization === true ? 'yes' : profile.work_authorization === false ? 'no' : 'yes'}
                  onChange={(e) => setProfile(p => ({ ...p, work_authorization: e.target.value === 'yes' }))}
                  className="w-full h-10 text-xs rounded-xl border border-[#E8E4DC] px-3 bg-white text-[#20242B]"
                >
                  <option value="yes">Yes, citizen / legally authorized to work</option>
                  <option value="no">No, requires visa sponsorship</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: SKILLS, LINKS & PROFILES (GITHUB MANDATORY *, PORTFOLIO & LINKEDIN OPTIONAL) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Skills, Links & Profiles
                </h2>
                <p className="text-xs text-[#777D85] mt-1">
                  GitHub profile is mandatory (<span className="text-[#DC2626]">*</span>). Portfolio and LinkedIn are optional.
                </p>
              </div>

              {/* Skills Tag Adder */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-[#20242B]">
                  Technical Skills <span className="text-[#DC2626]">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Type a skill and press Enter or Add..."
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
                    onClick={() => addSkill()}
                    className="bg-[#FAF9F5] border-[#E8E4DC] hover:bg-[#F2ECE3] h-10 px-4 rounded-xl text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                </div>

                {/* Popular Skill Suggestions */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] text-[#777D85] font-medium">Quick Add Suggestions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.map((s) => {
                      const alreadyAdded = (profile.skills || []).some(x => x.toLowerCase() === s.toLowerCase());
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => !alreadyAdded && addSkill(s)}
                          disabled={alreadyAdded}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                            alreadyAdded
                              ? 'bg-[#E9F0EB] text-[#2D5542] border-[#C6DEC9] opacity-70 cursor-default'
                              : 'bg-white text-[#555B64] border-[#E8E4DC] hover:bg-[#F2ECE3] hover:text-[#16233B]'
                          }`}
                        >
                          {alreadyAdded ? `✓ ${s}` : `+ ${s}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Active Tags */}
                <div className="flex flex-wrap gap-2 pt-2 min-h-[48px] p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC]">
                  {(profile.skills || []).length === 0 ? (
                    <span className="text-xs text-[#999DA3] italic">No skills added yet. Select suggestions above or type your own.</span>
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

              {/* GitHub, LinkedIn, Portfolio URLs */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="github_url" className="text-xs font-semibold text-[#20242B] flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-[#16233B]" /> GitHub Profile URL <span className="text-[#DC2626]">*</span>
                    </Label>
                    <span className="text-[11px] text-[#DC2626] font-medium">Mandatory</span>
                  </div>
                  <Input
                    id="github_url"
                    type="url"
                    value={profile.github_url || ''}
                    onChange={(e) => setProfile(p => ({ ...p, github_url: e.target.value }))}
                    placeholder="https://github.com/yourusername"
                    className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="linkedin_url" className="text-xs font-semibold text-[#20242B] flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-[#0A66C2]" /> LinkedIn Profile URL
                      </Label>
                      <span className="text-[11px] text-[#777D85]">Optional</span>
                    </div>
                    <Input
                      id="linkedin_url"
                      type="url"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => setProfile(p => ({ ...p, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="h-10 text-xs rounded-xl border-[#E8E4DC]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="portfolio_url" className="text-xs font-semibold text-[#20242B] flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#2D5542]" /> Portfolio / Website URL
                      </Label>
                      <span className="text-[11px] text-[#777D85]">Optional</span>
                    </div>
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
            </div>
          )}

          {/* STEP 5: REVIEW (ENTIRE PROFILE FROM START TO LAST) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0ECE4] pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#16233B]">
                  Review Your Complete Profile
                </h2>
                <p className="text-xs text-[#777D85] mt-1">
                  Ensure all details are accurate from start to finish before completing setup.
                </p>
              </div>

              {/* Section 1 Review: Basic Info */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-[#16233B] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2D5542]" /> Basic Information
                  </h3>
                  <button onClick={() => setCurrentStep(1)} className="text-[11px] text-[#2D5542] hover:underline font-semibold">
                    Edit Step 1
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div><span className="text-[#777D85]">Name:</span> <span className="font-medium text-[#16233B]">{profile.full_name || '—'}</span></div>
                  <div><span className="text-[#777D85]">Phone:</span> <span className="font-medium text-[#16233B]">{profile.phone_number || '—'}</span></div>
                  <div><span className="text-[#777D85]">DOB:</span> <span className="font-medium text-[#16233B]">{profile.date_of_birth || '—'}</span></div>
                  <div><span className="text-[#777D85]">Gender:</span> <span className="font-medium text-[#16233B]">{profile.gender || '—'}</span></div>
                  <div><span className="text-[#777D85]">Location:</span> <span className="font-medium text-[#16233B]">{profile.current_location || '—'}</span></div>
                  <div><span className="text-[#777D85]">Graduation:</span> <span className="font-medium text-[#16233B]">{profile.academic_year || '—'}</span></div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[#777D85]">College & Program:</span>{' '}
                    <span className="font-medium text-[#16233B]">{profile.degree} in {profile.branch} at {profile.college}</span>
                  </div>
                </div>
              </div>

              {/* Section 2 Review: Education */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-[#16233B] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#2D5542]" /> Academic Credentials
                  </h3>
                  <button onClick={() => setCurrentStep(2)} className="text-[11px] text-[#2D5542] hover:underline font-semibold">
                    Edit Step 2
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <p className="text-[#777D85]">College CGPA</p>
                    <p className="font-semibold text-[#2D5542]">{profile.cgpa ?? '—'} / {profile.cgpa_scale || 10}</p>
                  </div>
                  <div>
                    <p className="text-[#777D85]">10th Standard</p>
                    <p className="font-semibold text-[#16233B]">{profile.tenth_school || '—'} ({profile.tenth_percentage ?? '—'}%)</p>
                  </div>
                  <div>
                    <p className="text-[#777D85]">12th Standard</p>
                    <p className="font-semibold text-[#16233B]">{profile.twelfth_school || '—'} ({profile.twelfth_percentage ?? '—'}%)</p>
                  </div>
                </div>
              </div>

              {/* Section 3 Review: Preferences */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-[#16233B] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#2D5542]" /> Opportunity Preferences
                  </h3>
                  <button onClick={() => setCurrentStep(3)} className="text-[11px] text-[#2D5542] hover:underline font-semibold">
                    Edit Step 3
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div><span className="text-[#777D85]">Preferred Location:</span> <span className="font-medium text-[#16233B]">{profile.preferred_location || 'Pan India / Any'}</span></div>
                  <div><span className="text-[#777D85]">Availability:</span> <span className="font-medium text-[#16233B]">{profile.availability_weeks ? `${profile.availability_weeks} weeks` : 'Flexible'}</span></div>
                  <div><span className="text-[#777D85]">Hackathons:</span> <span className="font-medium text-[#16233B]">{profile.hackathon_interest !== false ? `Yes (Role: ${profile.hackathon_role || 'Full Stack'})` : 'No'}</span></div>
                  <div><span className="text-[#777D85]">Team Size:</span> <span className="font-medium text-[#16233B]">{profile.team_size || 4} members</span></div>
                </div>
              </div>

              {/* Section 4 Review: Skills & Links */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-[#16233B] flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-[#2D5542]" /> Skills & Profiles
                  </h3>
                  <button onClick={() => setCurrentStep(4)} className="text-[11px] text-[#2D5542] hover:underline font-semibold">
                    Edit Step 4
                  </button>
                </div>
                <div className="text-xs space-y-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div><span className="text-[#777D85]">GitHub:</span> <span className="font-mono text-[#16233B]">{profile.github_url || '—'}</span></div>
                    {profile.linkedin_url && <div><span className="text-[#777D85]">LinkedIn:</span> <span className="font-mono text-[#0A66C2]">{profile.linkedin_url}</span></div>}
                    {profile.portfolio_url && <div><span className="text-[#777D85]">Portfolio:</span> <span className="font-mono text-[#2D5542]">{profile.portfolio_url}</span></div>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.skills?.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E9F0EB] text-[#2D5542]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Buttons */}
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
                className="bg-[#16233B] hover:bg-[#20314F] text-white text-xs h-10 px-6 rounded-xl font-semibold shadow-sm flex items-center gap-2"
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
                    ? 'Next: Skills & Links →'
                    : currentStep === 4
                    ? 'Next: Review →'
                    : 'Save & Complete Profile ✓'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Completion & Help */}
        <div className="lg:col-span-4 space-y-5">
          {/* Why this matters Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E4DC] shadow-xs space-y-4">
            <h3 className="font-serif text-base font-semibold text-[#16233B]">
              Why this matters?
            </h3>
            <p className="text-xs text-[#777D85]">Your verified profile helps OpportunityKit:</p>

            <div className="space-y-3 pt-1">
              {[
                { icon: Shield, text: "Perform 100% deterministic eligibility audits" },
                { icon: Sparkles, text: "Give tailored next steps before deadlines" },
                { icon: Calendar, text: "Highlight time-sensitive criteria and blockers" },
                { icon: Briefcase, text: "Match you with internships matching your availability" },
                { icon: Compass, text: "Never guess or hallucinate eligibility decisions" },
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
              <span className="text-[#16233B]">Profile Setup Progress</span>
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
              Once saved, clicking &ldquo;Profile&rdquo; anytime will show your complete profile summary with instant edit controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

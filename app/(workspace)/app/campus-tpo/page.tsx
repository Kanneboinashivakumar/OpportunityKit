'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Info,
  Download,
  Upload,
  CheckCircle2,
  Users,
  BarChart3,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function CampusTPOPage() {
  const [requested, setRequested] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center shrink-0 border border-[#C6DEC9]">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-serif font-bold text-[#16233B] tracking-tight">
              Campus TPO
            </h1>
            <Badge className="bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] text-xs font-semibold">
              Demonstration View
            </Badge>
          </div>
          <p className="text-sm text-[#555B64] font-normal">
            Institutional placement office workspace for batch eligibility auditing and cohort readiness insights.
          </p>
        </div>
      </div>

      {/* Honest Disclaimer */}
      <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-[#FDE68A] bg-[#FEF3C7]/40 text-[#92400E]">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-sm">Demonstration & Institutional Proposal</p>
          <p className="text-[#78350F] leading-relaxed">
            This module showcases the Campus Training & Placement Office (TPO) capability.
            It uses the exact same deterministic eligibility engine that powers student audits,
            scaled for cohort analysis. Institutional pricing and pilot access are illustrative.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Proposed Pricing',
            value: '₹25,000 / year',
            note: 'Flat institutional license',
            icon: ShieldCheck,
          },
          {
            label: 'Cohort Capacity',
            value: 'Unlimited',
            note: 'Full branch & year coverage',
            icon: Users,
          },
          {
            label: 'Audit Engine',
            value: 'Deterministic',
            note: 'Zero AI hallucinations',
            icon: BarChart3,
          },
        ].map(({ label, value, note, icon: Icon }) => (
          <div
            key={label}
            className="p-5 rounded-2xl border border-[#E8E4DC] bg-white shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#777D85]">{label}</span>
              <Icon className="w-4 h-4 text-[#2D5542]" />
            </div>
            <p className="text-2xl font-serif font-bold text-[#16233B]">{value}</p>
            <p className="text-[11px] text-[#999DA3]">{note}</p>
          </div>
        ))}
      </div>

      {/* Proposed Features List */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-semibold text-[#16233B]">What Campus TPO Delivers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {[
            'Batch CSV upload with automatic profile normalization',
            'Tri-state MATCH / MISMATCH / MISSING INFO audit across entire batch',
            'Actionable gap analysis: identifies exact missing skills & course requirements',
            'Privacy-first architecture: no raw resume storage required',
            'Exportable eligibility shortlists for visiting recruiters',
            'Historical audit records preserved for accreditation reports',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2.5 text-xs text-[#555B64]">
              <CheckCircle2 className="w-4 h-4 text-[#2D5542] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CSV Template Specification */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#2D5542]" />
            <h2 className="text-base font-semibold text-[#16233B]">Batch CSV Data Format</h2>
          </div>
          <a
            href="data:text/csv;charset=utf-8,name,degree,branch,academic_year,cgpa,cgpa_scale,skills,github_url,portfolio_url,availability_weeks%0A%22Priya%20Sharma%22,%22B.Tech%22,%22CSE%22,%223rd%22,8.7,10,%22Python,React,SQL%22,%22https://github.com/priya%22,,8%0A%22Arjun%20Mehta%22,%22B.Tech%22,%22ECE%22,%224th%22,7.9,10,%22C++,Embedded%20C%22,%22%22,,12"
            download="opportunitykit-tpo-template.csv"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5542] hover:text-[#203D30]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </a>
        </div>

        <p className="text-xs text-[#777D85]">
          The batch upload engine parses student records with full schema validation:
        </p>

        <div className="bg-[#FAF9F5] border border-[#E8E4DC] rounded-xl p-3.5 text-xs font-mono text-[#555B64] overflow-x-auto leading-relaxed">
          name,degree,branch,academic_year,cgpa,cgpa_scale,skills,github_url,portfolio_url,availability_weeks<br />
          &quot;Priya Sharma&quot;,&quot;B.Tech&quot;,&quot;CSE&quot;,&quot;3rd&quot;,8.7,10,&quot;Python,React,SQL&quot;,&quot;https://github.com/priya&quot;,,8<br />
          &quot;Arjun Mehta&quot;,&quot;B.Tech&quot;,&quot;ECE&quot;,&quot;4th&quot;,7.9,10,&quot;C++,Embedded C&quot;,&quot;&quot;,,12
        </div>
      </div>

      {/* Pilot Request CTA */}
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#16233B]">Interested in an institutional pilot?</h3>
          <p className="text-xs text-[#777D85] mt-0.5">
            We collaborate with collegiate placement cells across India to streamline student opportunity readiness.
          </p>
        </div>

        {requested ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5542] bg-[#E9F0EB] px-3.5 py-2 rounded-xl border border-[#C6DEC9]">
            <CheckCircle2 className="w-4 h-4" />
            Pilot interest registered
          </span>
        ) : (
          <Button
            onClick={() => setRequested(true)}
            className="bg-[#16233B] hover:bg-[#20304C] text-white rounded-xl text-xs sm:text-sm font-medium py-2.5 px-5 h-auto flex items-center gap-2"
          >
            <span>Request Institutional Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

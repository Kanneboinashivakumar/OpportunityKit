'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/brand/logo';
import {
  CheckCircle2, XCircle, AlertCircle, ArrowRight, Play,
  Shield, Check, ChevronDown, Lock, UserCheck, Eye,
  Sparkles, FileText, Compass, Award, Briefcase, GraduationCap,
  Building, BookOpen, Layers, Users, Star, ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#20242B] selection:bg-[#E9F0EB] selection:text-[#2D5542]">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-[#E8E4DC] bg-[#FAF9F5]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#555B64]">
            <Link href="#product" className="hover:text-[#16233B] transition-colors">Product</Link>
            <Link href="#how-it-works" className="hover:text-[#16233B] transition-colors">How it works</Link>
            <Link href="#for-colleges" className="hover:text-[#16233B] transition-colors">For Colleges</Link>
            <Link href="#resources" className="hover:text-[#16233B] transition-colors">Resources</Link>
            <Link href="#pricing" className="hover:text-[#16233B] transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-white border-[#E0DCD3] hover:bg-[#F4EFEA] text-[#20242B] font-medium rounded-lg px-4 h-9 shadow-sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#16233B] hover:bg-[#20314F] text-white font-medium rounded-lg px-4 h-9 shadow-sm flex items-center gap-1.5">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-[#E8E4DC]">
        {/* Background Image Container with Gradient Fade */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 h-full opacity-35 lg:opacity-75">
            <Image
              src="/images/campus-sunset.jpg"
              alt="University campus walkway at sunset"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center"
            />
          </div>
          {/* Subtle warm wash gradient ensuring text remains crisp on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F5] via-[#FAF9F5]/90 to-transparent lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F5] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#E9F0EB] text-[#2D5542] border border-[#D5E4D8] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#2D5542] animate-pulse" />
              SMARTER OPPORTUNITIES FOR BRIGHTER FUTURES
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#16233B] leading-[1.12] mb-6">
              Turn opportunities <br className="hidden sm:inline" />
              into possibilities.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#555B64] leading-relaxed mb-8 max-w-xl">
              Analyze internships, scholarships, competitions and more. Get a personalized eligibility report, find gaps, and take action — all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-[#16233B] hover:bg-[#20314F] text-white px-7 py-3 h-12 rounded-xl font-medium text-sm shadow-md flex items-center justify-center gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/90 border-[#DED9CF] text-[#20242B] hover:bg-white px-6 py-3 h-12 rounded-xl font-medium text-sm shadow-sm flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 fill-current text-[#16233B]" /> Watch Demo
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
                ].map((src, idx) => (
                  <div key={idx} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-xs">
                    <Image src={src} alt="Student avatar" fill className="object-cover" sizes="32px" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#555B64]">
                <div className="flex text-[#F59E0B]">
                  {'★★★★★'.split('').map((char, i) => <span key={i}>{char}</span>)}
                </div>
                <span className="font-semibold text-[#16233B]">Trusted by 10,000+ students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Trust Bar */}
      <section className="bg-white border-b border-[#E8E4DC] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8 text-xs font-medium text-[#777D85]">
            <span className="text-[#999DA3] uppercase tracking-wider text-[11px]">Trusted by students from</span>
            <span className="px-3 py-1 bg-[#F4EFEA] rounded-md text-[#20242B] font-semibold">IITs</span>
            <span className="px-3 py-1 bg-[#F4EFEA] rounded-md text-[#20242B] font-semibold">NITs</span>
            <span className="px-3 py-1 bg-[#F4EFEA] rounded-md text-[#20242B] font-semibold">IIITs</span>
            <span className="px-3 py-1 bg-[#F4EFEA] rounded-md text-[#20242B] font-semibold">State Universities</span>
            <span className="px-3 py-1 bg-[#F4EFEA] rounded-md text-[#20242B] font-semibold">Private Colleges</span>
          </div>

          <div className="flex items-center gap-8 divide-x divide-[#E8E4DC] text-center">
            <div className="pl-0">
              <p className="text-lg font-bold text-[#16233B]">10K+</p>
              <p className="text-xs text-[#777D85]">Students</p>
            </div>
            <div className="pl-8">
              <p className="text-lg font-bold text-[#16233B]">500+</p>
              <p className="text-xs text-[#777D85]">Opportunities analyzed</p>
            </div>
            <div className="pl-8">
              <p className="text-lg font-bold text-[#16233B]">4.8/5</p>
              <p className="text-xs text-[#777D85]">User satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Value Pillars */}
      <section id="product" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Sparkles,
              title: "AI-Powered Analysis",
              desc: "Extracts requirements from any announcement in seconds."
            },
            {
              icon: CheckCircle2,
              title: "Personalized Eligibility",
              desc: "See what you match, what's missing, and how to improve."
            },
            {
              icon: FileText,
              title: "Actionable Roadmap",
              desc: "Get clear next steps before the deadline."
            },
            {
              icon: Users,
              title: "Built for Students & Colleges",
              desc: "Students get guidance. Colleges get a powerful dashboard."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-xs hover:border-[#D4CCC2] transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[#16233B] text-base mb-1.5">{item.title}</h3>
              <p className="text-xs text-[#555B64] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section: 3 Simple Steps */}
      <section id="how-it-works" className="py-16 bg-white border-y border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#2D5542] mb-2">How It Works</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#16233B] mb-3">
              From opportunity to action — in three simple steps.
            </h2>
            <p className="text-sm text-[#555B64]">
              Paste. Analyze. Take action. It&apos;s that simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "1",
                title: "Paste an opportunity",
                desc: "Paste the announcement link, PDF, or text. Our AI extracts all the key requirements.",
                visual: (
                  <div className="mt-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] text-xs font-mono text-[#555B64] space-y-2">
                    <div className="h-2.5 bg-[#E8E4DC] rounded-full w-3/4" />
                    <div className="h-2.5 bg-[#E8E4DC] rounded-full w-full" />
                    <div className="h-2.5 bg-[#E8E4DC] rounded-full w-1/2" />
                  </div>
                )
              },
              {
                step: "2",
                title: "Check your eligibility",
                desc: "We compare the requirements with your profile and show clear match, mismatch, and missing information.",
                visual: (
                  <div className="mt-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] text-xs space-y-2">
                    <div className="flex items-center justify-between text-[#16A34A] bg-[#F0FDF4] px-2.5 py-1 rounded-md border border-[#BBF7D0]">
                      <span>CGPA &ge; 7.0</span>
                      <span>MATCH ✓</span>
                    </div>
                    <div className="flex items-center justify-between text-[#D97706] bg-[#FFFBEB] px-2.5 py-1 rounded-md border border-[#FDE68A]">
                      <span>Resume required</span>
                      <span>MISSING INFO</span>
                    </div>
                  </div>
                )
              },
              {
                step: "3",
                title: "Get your action plan",
                desc: "Understand what to do next, fill the gaps, and apply with confidence before the deadline.",
                visual: (
                  <div className="mt-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] text-xs space-y-2">
                    <div className="flex items-center gap-2 text-[#20242B]">
                      <span className="w-4 h-4 rounded-full bg-[#16233B] text-white flex items-center justify-center text-[10px]">1</span>
                      <span>Upload updated resume</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#20242B]">
                      <span className="w-4 h-4 rounded-full bg-[#16233B] text-white flex items-center justify-center text-[10px]">2</span>
                      <span>Submit application by Nov 5</span>
                    </div>
                  </div>
                )
              }
            ].map((s, idx) => (
              <div key={idx} className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#E8E4DC] flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#16233B] text-white font-bold text-xs flex items-center justify-center mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-base text-[#16233B] mb-2">{s.title}</h3>
                  <p className="text-xs text-[#555B64] leading-relaxed">{s.desc}</p>
                </div>
                {s.visual}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase: "Everything you need in one place" with Interactive Preview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: UI Mockup Preview */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-lg p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#16233B] text-white flex items-center justify-center text-xs font-bold">OK</div>
                  <span className="font-semibold text-sm text-[#16233B]">OpportunityKit Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  <span className="text-xs text-[#777D85]">Live Preview</span>
                </div>
              </div>

              {/* Header stats inside mockup */}
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { label: "Analyzed", val: "12", col: "text-[#16233B]" },
                  { label: "Eligible", val: "8", col: "text-[#16A34A]" },
                  { label: "In Progress", val: "3", col: "text-[#D97706]" },
                  { label: "Deadlines", val: "5", col: "text-[#DC2626]" },
                ].map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] text-center">
                    <p className={`text-xl font-bold ${stat.col}`}>{stat.val}</p>
                    <p className="text-[10px] text-[#777D85] uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent opportunity items inside mockup */}
              <div className="space-y-2 pt-1">
                {[
                  { title: "Google Summer Internship 2025", role: "Software Engineering", status: "Eligible", statusCol: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]", time: "2 days ago" },
                  { title: "Microsoft Learn Student Ambassador", role: "Community Program", status: "Needs Work", statusCol: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]", time: "5 days ago" },
                  { title: "ISRO Student Research Programme", role: "Aerospace Internship", status: "Not Eligible", statusCol: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]", time: "1 week ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] text-xs">
                    <div>
                      <p className="font-semibold text-[#16233B]">{item.title}</p>
                      <p className="text-[11px] text-[#777D85]">{item.role} · {item.time}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-medium border text-[11px] ${item.statusCol}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Feature Description */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#F4EFEA] text-[#16233B]">
              A Smarter Way to Stay Ahead
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#16233B] leading-tight">
              Everything you need in one place.
            </h2>
            <p className="text-sm text-[#555B64] leading-relaxed">
              From discovery to application, OpportunityKit helps you make informed decisions with clarity and confidence.
            </p>

            <div className="space-y-3.5 pt-2">
              {[
                "Real-time opportunity analysis from text or URL",
                "Personalized eligibility reports based on your profile",
                "Deadline tracking and reminders",
                "Gap identification with learning suggestions",
                "Save and organize opportunities in one unified workspace",
              ].map((text, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-sm text-[#20242B] font-medium">{text}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/signup">
                <Button className="bg-[#16233B] hover:bg-[#20314F] text-white px-6 h-11 rounded-xl text-sm font-medium flex items-center gap-2">
                  Explore the Product <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Categories Grid */}
      <section className="py-16 bg-white border-y border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#2D5542] mb-2">Opportunity Categories</p>
            <h2 className="font-serif text-3xl font-medium text-[#16233B] mb-2">
              Explore Opportunities Across Categories
            </h2>
            <p className="text-xs text-[#555B64]">Analyze and track opportunities from multiple domains.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Briefcase, title: "Internships", desc: "Find and evaluate internship opportunities" },
              { icon: GraduationCap, title: "Scholarships", desc: "Check eligibility for national & global grants" },
              { icon: Award, title: "Competitions", desc: "Participate in hackathons and tech contests" },
              { icon: BookOpen, title: "Research Programs", desc: "Explore academic and lab opportunities" },
              { icon: Compass, title: "Fellowships", desc: "Discover fellowships & leadership programs" },
              { icon: Sparkles, title: "More Opportunities", desc: "Stay updated with newly announced programs" },
            ].map((cat, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] hover:border-[#16233B] transition-all text-center group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E4DC] text-[#16233B] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <cat.icon className="w-5 h-5 text-[#2D5542]" />
                </div>
                <h4 className="font-semibold text-sm text-[#16233B] mb-1">{cat.title}</h4>
                <p className="text-[11px] text-[#777D85] leading-snug">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest Triage Visualizer (Image 5) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#2D5542]">Honest Triage</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#16233B] leading-tight">
              Clear eligibility results <br />
              <span className="italic font-normal">you can trust.</span>
            </h2>
            <p className="text-sm text-[#555B64] leading-relaxed">
              We analyze the opportunity against your profile and show exactly what matches, what&apos;s missing, and what doesn&apos;t meet the criteria — with clear reasons.
            </p>
            <div className="pt-2">
              <Link href="/signup">
                <Button variant="outline" className="border-[#16233B] text-[#16233B] hover:bg-[#16233B] hover:text-white rounded-xl text-sm h-11 px-6 transition-all flex items-center gap-2">
                  See a Sample Analysis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* 3 Interactive Cards (MATCH, MISSING INFO, MISMATCH) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: MATCH */}
            <div className="bg-white p-5 rounded-2xl border border-[#BBF7D0] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#16A34A] font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>MATCH</span>
              </div>
              <p className="text-[11px] text-[#777D85]">You meet this requirement.</p>
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]/60 space-y-1.5">
                  <p className="text-xs font-semibold text-[#16233B]">Education</p>
                  <p className="text-[11px] text-[#555B64]">B.Tech/BE in CSE, IT or related branch</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#166534]">
                    Your profile: B.Tech CSE ✓
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]/60 space-y-1.5">
                  <p className="text-xs font-semibold text-[#16233B]">CGPA</p>
                  <p className="text-[11px] text-[#555B64]">Minimum 7.0</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#166534]">
                    Your profile: 8.2 ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: MISSING INFO */}
            <div className="bg-white p-5 rounded-2xl border border-[#FDE68A] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#D97706] font-semibold text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>MISSING INFO</span>
              </div>
              <p className="text-[11px] text-[#777D85]">We need more information from you.</p>
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]/60 space-y-1.5">
                  <p className="text-xs font-semibold text-[#16233B]">Certificates</p>
                  <p className="text-[11px] text-[#555B64]">NPTEL/Coursera certificate in ML/AI (preferred)</p>
                  <span className="inline-block text-[10px] font-semibold text-[#D97706] hover:underline cursor-pointer">
                    Add certification &rarr;
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]/60 space-y-1.5">
                  <p className="text-xs font-semibold text-[#16233B]">Resume</p>
                  <p className="text-[11px] text-[#555B64]">Updated resume required (PDF, &lt; 2 MB)</p>
                  <span className="inline-block text-[10px] font-semibold text-[#D97706] hover:underline cursor-pointer">
                    Upload resume &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: MISMATCH */}
            <div className="bg-white p-5 rounded-2xl border border-[#FECACA] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-sm">
                <XCircle className="w-5 h-5" />
                <span>MISMATCH</span>
              </div>
              <p className="text-[11px] text-[#777D85]">You don&apos;t meet this requirement.</p>
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]/60 space-y-1.5">
                  <p className="text-xs font-semibold text-[#16233B]">Graduation Year</p>
                  <p className="text-[11px] text-[#555B64]">Must be graduating in 2026</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FEE2E2] text-[#991B1B]">
                    Your profile: 2027 ✕
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]/60 space-y-1.5">
                  <p className="text-xs font-semibold text-[#16233B]">Location</p>
                  <p className="text-[11px] text-[#555B64]">Open only for India residents</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#DCFCE7] text-[#166534]">
                    Your profile: India (✓)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Image 5) */}
      <section id="pricing" className="py-20 bg-white border-y border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#2D5542] mb-2">Pricing</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#16233B] mb-3">
              Simple and transparent.
            </h2>
            <p className="text-sm text-[#555B64]">
              Get started for free. A dedicated plan for colleges to empower their placement ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Plan */}
            <div className="p-8 rounded-3xl bg-[#FAF9F5] border border-[#E8E4DC] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center font-bold text-sm">🎓</div>
                    <h3 className="font-semibold text-lg text-[#16233B]">For Students</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E9F0EB] text-[#2D5542]">
                    Free Forever
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-4xl font-bold text-[#16233B]">₹0</span>
                  <p className="text-xs text-[#777D85] mt-1">Everything you need to analyze and apply with confidence.</p>
                </div>
                <div className="space-y-2.5 pt-4">
                  {[
                    "Analyze unlimited opportunities",
                    "Personalized eligibility reports",
                    "Gap analysis and action plan",
                    "Save and organize opportunities",
                    "Profile management",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#20242B]">
                      <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/signup" className="pt-4">
                <Button className="w-full bg-[#16233B] hover:bg-[#20314F] text-white rounded-xl h-11 font-medium text-sm flex items-center justify-center gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Colleges TPO Plan */}
            <div id="for-colleges" className="p-8 rounded-3xl bg-white border-2 border-[#16233B] shadow-md space-y-6 flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F4EFEA] text-[#16233B] flex items-center justify-center font-bold text-sm">🏛️</div>
                    <h3 className="font-semibold text-lg text-[#16233B]">For Colleges (TPOs)</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4338CA]">
                    Proposed Plan
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#16233B]">₹25,000</span>
                    <span className="text-sm text-[#777D85]">/ year</span>
                  </div>
                  <p className="text-xs text-[#777D85] mt-1">Empower your Training & Placement Office with a dedicated dashboard.</p>
                </div>
                <div className="space-y-2.5 pt-4">
                  {[
                    "Analyze and share opportunities with students",
                    "Student eligibility analytics (aggregate and anonymized)",
                    "Track participation and application status",
                    "Identify skill gaps across your campus",
                    "Priority support and onboarding",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#20242B]">
                      <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Link href="/app/campus-tpo">
                  <Button className="w-full bg-[#16233B] hover:bg-[#20314F] text-white rounded-xl h-11 font-medium text-sm flex items-center justify-center gap-2">
                    Request a Demo <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#777D85] mt-8">
            Note: Campus pricing is a proposed model and can be discussed based on your institution&apos;s requirements.
          </p>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#2D5542] mb-2">What Students Say</p>
          <h2 className="font-serif text-3xl font-medium text-[#16233B]">
            Trusted by 10,000+ students across India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "OpportunityKit saved me so much time. I could instantly check my eligibility and focus on the right opportunities.",
              name: "Riya Sharma",
              college: "B.Tech, IIT Hyderabad",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
            },
            {
              quote: "The action plan helped me fix my gaps before the deadline. I finally applied with confidence.",
              name: "Arjun Mehta",
              college: "B.Tech, NIT Trichy",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
            },
            {
              quote: "The clean interface and accurate analysis make it a must-have for every student.",
              name: "Sneha Reddy",
              college: "B.Tech, IIIT Bangalore",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
            }
          ].map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-xs flex flex-col justify-between space-y-4">
              <p className="text-sm text-[#20242B] italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-[#F0ECE4]">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#E8E4DC]">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="40px" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#16233B]">{t.name}</h4>
                  <p className="text-[11px] text-[#777D85]">{t.college}</p>
                </div>
                <div className="ml-auto flex text-[#F59E0B] text-xs">
                  {'★★★★★'.split('').map((c, i) => <span key={i}>{c}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions (Image 5) */}
      <section className="py-20 bg-white border-y border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#2D5542]">FAQ</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#16233B] leading-tight">
                Frequently asked <br />questions.
              </h2>
              <p className="text-sm text-[#555B64] leading-relaxed">
                Everything you need to know about OpportunityKit.
              </p>
              <div className="pt-2">
                <Link href="mailto:support@opportunitykit.com">
                  <Button variant="outline" className="border-[#16233B] text-[#16233B] hover:bg-[#16233B] hover:text-white rounded-xl text-sm h-10 px-5 flex items-center gap-2">
                    Contact Us <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {[
                {
                  q: "How accurate is the eligibility analysis?",
                  a: "The requirements extraction is performed by server-side Gemini AI. However, all eligibility checks are performed by a 100% deterministic rule engine that compares parsed requirements against your profile data. There is zero hallucination in the decision itself."
                },
                {
                  q: "What kind of opportunities can I analyze?",
                  a: "OpportunityKit supports internships, scholarships, competitions, hackathons, fellowships, and research program announcements pasted as plain text or webpage URLs."
                },
                {
                  q: "Is my profile data safe?",
                  a: "Yes. All personal information and audit results are protected by Supabase Row-Level Security (RLS). Your data is private to you and never shared with advertisers or third parties."
                },
                {
                  q: "Does OpportunityKit apply on my behalf?",
                  a: "No. OpportunityKit gives you the exact action plan and verification steps so you can submit your application directly on the official portal with zero surprises."
                },
                {
                  q: "Is there a limit on the number of analyses?",
                  a: "No! Student accounts can analyze unlimited opportunities for free."
                },
                {
                  q: "Is the college plan final? Can it be customized?",
                  a: "The ₹25,000/year institutional plan is a proposed model and can be tailored to match your university's size, cohort requirements, and placement workflow."
                }
              ].map((faq, i) => (
                <div key={i} className="border border-[#E8E4DC] rounded-xl overflow-hidden transition-all bg-[#FAF9F5]">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left font-medium text-sm text-[#16233B] hover:text-[#2D5542]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#777D85] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 pt-1 text-xs text-[#555B64] leading-relaxed border-t border-[#E8E4DC]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy (Image 5) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#2D5542] mb-2">Your Data, Our Priority</p>
          <h2 className="font-serif text-3xl font-medium text-[#16233B] mb-2">
            Built with security and privacy in mind.
          </h2>
          <p className="text-xs text-[#555B64]">We follow industry best practices to keep your data safe and give you full control over your information.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: "Secure by design",
              desc: "Your data is encrypted in transit and at rest with Supabase RLS."
            },
            {
              icon: Lock,
              title: "You're in control",
              desc: "Update or delete your personal data and analyses anytime."
            },
            {
              icon: UserCheck,
              title: "No spam",
              desc: "We never share your personal data or email with third parties."
            },
            {
              icon: Eye,
              title: "Transparent AI use",
              desc: "AI extracts information from public announcements to help you, not to make final decisions."
            }
          ].map((sec, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-xs text-left">
              <div className="w-10 h-10 rounded-xl bg-[#E9F0EB] text-[#2D5542] flex items-center justify-center mb-4">
                <sec.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-[#16233B] mb-1.5">{sec.title}</h3>
              <p className="text-xs text-[#555B64] leading-relaxed">{sec.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pre-Footer Banner (Image 5) */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-t border-[#E8E4DC]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/campus-sunset.jpg"
            alt="Campus sunset"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#16233B]/80 backdrop-blur-xs" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-4 text-center lg:text-left">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#A7F3D0]">Ready to explore more opportunities?</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium leading-tight">
              Start your journey today with OpportunityKit.
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Turn internships, scholarships, and competitions into real possibilities.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link href="/signup">
                <Button size="lg" className="bg-white hover:bg-[#FAF9F5] text-[#16233B] font-semibold h-12 px-6 rounded-xl text-sm shadow-md flex items-center gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 h-12 px-6 rounded-xl text-sm flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current" /> Watch Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating Pill Feature Badges */}
          <div className="space-y-3 w-full sm:w-auto">
            {[
              { icon: Compass, text: "Analyze opportunities" },
              { icon: CheckCircle2, text: "Find your gaps" },
              { icon: Award, text: "Take action with confidence" },
            ].map((pill, idx) => (
              <div key={idx} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-medium shadow-sm">
                <pill.icon className="w-4 h-4 text-[#A7F3D0]" />
                <span>{pill.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (Image 5) */}
      <footer className="bg-white border-t border-[#E8E4DC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[#E8E4DC]">
            <div className="col-span-2 space-y-3">
              <BrandLogo />
              <p className="text-xs text-[#777D85] max-w-sm">
                Smarter opportunities for brighter futures.
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#16233B] uppercase tracking-wider">Product</p>
              <div className="flex flex-col space-y-2 text-xs text-[#555B64]">
                <Link href="#product" className="hover:text-[#16233B]">Features</Link>
                <Link href="#how-it-works" className="hover:text-[#16233B]">How it works</Link>
                <Link href="#pricing" className="hover:text-[#16233B]">Pricing</Link>
                <Link href="/app/campus-tpo" className="hover:text-[#16233B]">For Colleges</Link>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#16233B] uppercase tracking-wider">Resources</p>
              <div className="flex flex-col space-y-2 text-xs text-[#555B64]">
                <Link href="/app/analyze" className="hover:text-[#16233B]">Opportunity Guide</Link>
                <Link href="#pricing" className="hover:text-[#16233B]">Student Tips</Link>
                <Link href="#faq" className="hover:text-[#16233B]">Help Centre</Link>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#16233B] uppercase tracking-wider">Company</p>
              <div className="flex flex-col space-y-2 text-xs text-[#555B64]">
                <Link href="/privacy" className="hover:text-[#16233B]">About Us</Link>
                <Link href="/privacy" className="hover:text-[#16233B]">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-[#16233B]">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777D85]">
            <p>&copy; {new Date().getFullYear()} OpportunityKit. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs font-medium text-[#555B64]">
              <span className="hover:text-[#16233B] cursor-pointer">LinkedIn</span>
              <span className="hover:text-[#16233B] cursor-pointer">X</span>
              <span className="hover:text-[#16233B] cursor-pointer">Instagram</span>
              <span className="hover:text-[#16233B] cursor-pointer">YouTube</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

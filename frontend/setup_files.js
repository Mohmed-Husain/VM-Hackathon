const fs = require('fs');
const path = require('path');

const files = {
  // 1. cn.ts
  'src/lib/cn.ts': `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
`,

  // 2. homepage-data.ts
  'src/content/homepage-data.ts': `export interface ActionCardItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  accentColor?: string;
}

export interface ProcessStepItem {
  stepNumber: number;
  title: string;
  description: string;
  iconName: string;
}

export interface VisaCategoryCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
}

export interface HelpCardItem {
  title: string;
  description: string;
  iconName: string;
  href: string;
}

export interface UsefulLinkItem {
  title: string;
  url: string;
}

export const ACTION_CARDS: ActionCardItem[] = [
  {
    id: "apply-now",
    title: "Apply Now",
    description: "Start a new eVisa application",
    iconName: "FilePlus2",
    href: "/dashboard?action=new",
  },
  {
    id: "resume-draft",
    title: "Resume Draft",
    description: "Continue a partially filled application",
    iconName: "ClipboardCheck",
    href: "/dashboard",
  },
  {
    id: "pay-fee",
    title: "Pay eVisa Fee",
    description: "Verify payment or pay eVisa fee",
    iconName: "CreditCard",
    href: "/dashboard",
  },
  {
    id: "print-application",
    title: "Print Application",
    description: "Print your eVisa application",
    iconName: "Printer",
    href: "/dashboard",
  },
  {
    id: "check-status",
    title: "Check Visa Status",
    description: "Track your eVisa application status",
    iconName: "Search",
    href: "/dashboard",
  },
  {
    id: "reupload-docs",
    title: "Re-upload Documents",
    description: "Upload additional or updated documents",
    iconName: "UploadCloud",
    href: "/dashboard",
  },
  {
    id: "sample-form",
    title: "Sample eVisa Form",
    description: "View a sample eVisa application",
    iconName: "FileText",
    href: "#sample-form",
  },
];

export const PROCESS_STEPS: ProcessStepItem[] = [
  {
    stepNumber: 1,
    title: "Apply Online",
    description: "Upload photo and passport and fill application form",
    iconName: "Upload",
  },
  {
    stepNumber: 2,
    title: "Pay eVisa Fee",
    description: "Make payment online using credit / debit card or payment wallet",
    iconName: "CreditCard",
  },
  {
    stepNumber: 3,
    title: "Receive ETA Online",
    description: "Electronic Travel Authorization (ETA) will be sent to your e-mail",
    iconName: "Mail",
  },
  {
    stepNumber: 4,
    title: "Fly to India",
    description: "Print ETA and present at Immigration Check Post stamped on passport",
    iconName: "Plane",
  },
];

export const VISA_CATEGORIES: VisaCategoryCard[] = [
  {
    id: "tourist",
    title: "e-Tourist Visa",
    description: "For tourism and sightseeing",
    iconName: "Camera",
    href: "/dashboard?category=tourist_standard",
  },
  {
    id: "business",
    title: "e-Business Visa",
    description: "For business meetings, conferences, etc.",
    iconName: "Briefcase",
    href: "/dashboard?category=business_expedited",
  },
  {
    id: "medical",
    title: "e-Medical Visa",
    description: "For medical treatment in India",
    iconName: "HeartPulse",
    href: "/dashboard?category=medical",
  },
  {
    id: "medical-attendant",
    title: "e-Medical Attendant Visa",
    description: "For attendants of medical visa holders",
    iconName: "UserCheck",
    href: "/dashboard?category=medical_attendant",
  },
  {
    id: "student",
    title: "e-Student Visa",
    description: "For academic and training purposes",
    iconName: "GraduationCap",
    href: "/dashboard?category=student",
  },
  {
    id: "family",
    title: "e-Family Visa",
    description: "For visiting family or friends in India",
    iconName: "Users",
    href: "/dashboard?category=family",
  },
  {
    id: "transit",
    title: "e-Transit Visa",
    description: "For transit through India",
    iconName: "TrainTrack",
    href: "/dashboard?category=transit",
  },
  {
    id: "miscellaneous",
    title: "e-Miscellaneous Visa",
    description: "For other short-term purposes",
    iconName: "LayoutGrid",
    href: "/dashboard?category=misc",
  },
];

export const ADVISORY_ITEMS: string[] = [
  "Government of India makes no provision of charging of any emergency fees or additional fees for grant of any emergency / express e-visa.",
  "Those travelling to India are also advised to go through instructions available on the website of Bureau of Immigration at boi.gov.in.",
  "eVisa is admissible only under the categories listed above.",
  "Beware of fraudulent websites and agents. Apply only on official website.",
];

export const IMPORTANT_INFO_ITEMS: string[] = [
  "If unable to complete the application form, you can save and return later to complete.",
  "You can re-upload the same at the bottom of the page if any Document/Image is not appropriate.",
  "After submission, ETA will be sent to your e-mail.",
  "Applicant should normally receive this mail within 24 hours.",
];

export const HELP_CARDS: HelpCardItem[] = [
  {
    title: "Countries/Regions Eligible",
    description: "Check if your country is eligible for eVisa",
    iconName: "ShieldCheck",
    href: "#eligibility",
  },
  {
    title: "Instructions for Applicant",
    description: "Step-by-step guide to fill application form",
    iconName: "FileText",
    href: "#instructions",
  },
  {
    title: "FAQs",
    description: "Find answers to common questions",
    iconName: "HelpCircle",
    href: "#faqs",
  },
];

export const USEFUL_LINKS: UsefulLinkItem[] = [
  {
    title: "Ministry of Home Affairs, Govt. of India",
    url: "https://www.mha.gov.in",
  },
  {
    title: "Ministry of External Affairs, Govt. of India",
    url: "https://mea.gov.in",
  },
  {
    title: "Ministry of Tourism, Govt. of India",
    url: "https://tourism.gov.in",
  },
  {
    title: "Bureau of Immigration, Govt. of India",
    url: "https://boi.gov.in",
  },
  {
    title: "Incredible India, Govt. of India",
    url: "https://www.incredibleindia.org",
  },
];
`,

  // 3. hero-section.tsx
  'src/components/home/hero-section.tsx': `"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileEdit, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:py-14 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F8FAFC] border-b border-slate-200/60">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0F172A] tracking-tight leading-[1.15]">
                Apply for an Indian eVisa
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                Your official gateway to visit India. Simple, secure and hassle-free.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/dashboard?action=new"
                className="btn-primary py-3 px-6 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="btn-secondary py-3 px-5 text-sm sm:text-base font-semibold shadow-xs hover:shadow-md transition-all"
              >
                <FileEdit className="w-4 h-4 text-[#0B2A6F]" />
                <span>Resume Application</span>
              </Link>
            </div>

            {/* Trust Seal Banner */}
            <div className="flex items-center gap-2 pt-2 text-xs sm:text-sm text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Trusted by millions of travellers worldwide</span>
            </div>
          </div>

          {/* Right Column: Taj Mahal Illustration with Tricolor Wave */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[460px] aspect-[15/8] sm:aspect-[16/9] drop-shadow-xs">
              <Image
                src="/assets/taj-mahal-hero.svg"
                alt="Taj Mahal official illustration"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`,

  // 4. action-cards.tsx
  'src/components/home/action-cards.tsx': `"use client";

import React from "react";
import Link from "next/link";
import {
  FilePlus2,
  ClipboardCheck,
  CreditCard,
  Printer,
  Search,
  UploadCloud,
  FileText,
  ArrowRight,
} from "lucide-react";
import { ACTION_CARDS } from "@/content/homepage-data";

const ICON_MAP: Record<string, React.ElementType> = {
  FilePlus2,
  ClipboardCheck,
  CreditCard,
  Printer,
  Search,
  UploadCloud,
  FileText,
};

export function ActionCards() {
  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight mb-6">
          I want to...
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4">
          {ACTION_CARDS.map((card) => {
            const Icon = ICON_MAP[card.iconName] || FileText;

            return (
              <Link
                key={card.id}
                href={card.href}
                className="group portal-card p-4 sm:p-5 flex flex-col justify-between text-left hover:-translate-y-1 transition-all duration-200 text-decoration-none"
              >
                <div>
                  {/* Circular Icon Badge */}
                  <div className="w-11 h-11 rounded-full bg-blue-50/90 border border-blue-100 flex items-center justify-center text-[#0B2A6F] mb-3.5 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-[#2563EB]" />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm sm:text-[14.5px] text-[#0F172A] leading-snug group-hover:text-[#0B2A6F] transition-colors">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                </div>

                {/* Bottom CTA Arrow */}
                <div className="pt-4 flex items-center text-[#2563EB] text-xs font-semibold group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`,

  // 5. process-stepper.tsx
  'src/components/home/process-stepper.tsx': `"use client";

import React from "react";
import Link from "next/link";
import { Upload, CreditCard, Mail, Plane, ArrowRight } from "lucide-react";
import { PROCESS_STEPS } from "@/content/homepage-data";

const ICON_MAP: Record<string, React.ElementType> = {
  Upload,
  CreditCard,
  Mail,
  Plane,
};

export function ProcessStepper() {
  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="portal-card p-6 sm:p-8 bg-white">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-6 sm:pb-8 border-b border-slate-100 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                E-Visa Application Process
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Four simple steps to obtain your Electronic Travel Authorization
              </p>
            </div>
            <Link
              href="#instructions"
              className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#0B2A6F] flex items-center gap-1 transition-colors"
            >
              <span>How it works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Stepper Grid with Connectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {PROCESS_STEPS.map((step, idx) => {
              const Icon = ICON_MAP[step.iconName] || Upload;
              const isLast = idx === PROCESS_STEPS.length - 1;

              return (
                <div key={step.stepNumber} className="relative flex flex-col items-center text-center group">
                  {/* Dotted Connector Line (Desktop) */}
                  {!isLast && (
                    <div
                      className="hidden lg:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-slate-200 z-0"
                      aria-hidden="true"
                    />
                  )}

                  {/* Step Icons & Badges */}
                  <div className="relative z-10 flex items-center gap-3 mb-4">
                    {/* Number Badge */}
                    <div className="w-8 h-8 rounded-full bg-[#0B2A6F] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {step.stepNumber}
                    </div>

                    {/* Feature Icon Circle */}
                    <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#2563EB] group-hover:scale-105 group-hover:bg-blue-100 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="font-bold text-base text-[#0F172A] mt-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-[220px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
`,

  // 6. visa-categories.tsx
  'src/components/home/visa-categories.tsx': `"use client";

import React from "react";
import Link from "next/link";
import {
  Camera,
  Briefcase,
  HeartPulse,
  UserCheck,
  GraduationCap,
  Users,
  TrainTrack,
  LayoutGrid,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { VISA_CATEGORIES } from "@/content/homepage-data";

const ICON_MAP: Record<string, React.ElementType> = {
  Camera,
  Briefcase,
  HeartPulse,
  UserCheck,
  GraduationCap,
  Users,
  TrainTrack,
  LayoutGrid,
};

export function VisaCategories() {
  return (
    <section id="categories" className="py-8 sm:py-10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Choose your eVisa Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select the appropriate visa category tailored to your purpose of travel
            </p>
          </div>
          <Link
            href="/dashboard?action=new"
            className="text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#0B2A6F] flex items-center gap-1 transition-colors"
          >
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4x2 Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VISA_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Camera;

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group portal-card p-4 sm:p-5 flex items-center justify-between gap-3 hover:-translate-y-0.5 hover:border-blue-200 transition-all text-decoration-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-blue-50/90 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0 group-hover:bg-[#0B2A6F] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title & Description */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#0B2A6F] transition-colors truncate">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Right Chevron */}
                <div className="text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`,

  // 7. advisory-section.tsx
  'src/components/home/advisory-section.tsx': `import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ADVISORY_ITEMS } from "@/content/homepage-data";

export function AdvisorySection() {
  return (
    <div className="portal-card p-6 sm:p-7 bg-amber-50/40 border-amber-200/80 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <h3 className="font-bold text-base sm:text-lg text-amber-900 tracking-tight">
            Important Advisory
          </h3>
        </div>

        {/* Bullet List */}
        <ul className="space-y-3 text-xs sm:text-[13px] text-amber-950/80 leading-relaxed">
          {ADVISORY_ITEMS.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {item.includes("boi.gov.in") ? (
                  <>
                    Those travelling to India are also advised to go through instructions available on the website of Bureau of Immigration at{" "}
                    <a
                      href="https://boi.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline text-amber-900 hover:text-amber-700"
                    >
                      boi.gov.in
                    </a>
                    .
                  </>
                ) : (
                  item
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
`,

  // 8. important-info.tsx
  'src/components/home/important-info.tsx': `import React from "react";
import { CheckCircle2 } from "lucide-react";
import { IMPORTANT_INFO_ITEMS } from "@/content/homepage-data";

export function ImportantInfo() {
  return (
    <div className="portal-card p-6 sm:p-7 bg-emerald-50/30 border-emerald-200/70 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <h3 className="font-bold text-base sm:text-lg text-emerald-950 tracking-tight">
            Important Information
          </h3>
        </div>

        {/* Bullet List */}
        <ul className="space-y-3 text-xs sm:text-[13px] text-emerald-950/85 leading-relaxed">
          {IMPORTANT_INFO_ITEMS.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
`,

  // 9. help-support.tsx
  'src/components/home/help-support.tsx': `"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  HelpCircle,
  CreditCard,
  MapPin,
  PhoneCall,
  Phone,
  ArrowRight,
} from "lucide-react";
import { HELP_CARDS } from "@/content/homepage-data";

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  FileText,
  HelpCircle,
};

export function HelpSupport() {
  return (
    <div id="help" className="portal-card p-6 sm:p-7 bg-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#0F172A] tracking-tight">
              Help &amp; Support
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official guidelines, checkpoints, and 24x7 help desks
            </p>
          </div>
          <Link
            href="#faqs"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#0B2A6F] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Top 3 Help Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {HELP_CARDS.map((card, idx) => {
            const Icon = ICON_MAP[card.iconName] || HelpCircle;

            return (
              <Link
                key={idx}
                href={card.href}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-blue-50/60 hover:border-blue-200 transition-all text-decoration-none group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2 group-hover:bg-[#0B2A6F] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-bold text-xs text-slate-900 group-hover:text-[#0B2A6F] transition-colors">
                  {card.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {card.description}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom 4 Compact Contact/Info Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Payment Related */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/50">
            <CreditCard className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Payment Related</span>
              <span className="text-[11px] text-slate-500">Information on fees &amp; payment methods</span>
            </div>
          </div>

          {/* Authorized Checkposts */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/50">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Authorized Checkposts</span>
              <span className="text-[11px] text-slate-500">Immigration checkpoints where eVisa is valid</span>
            </div>
          </div>

          {/* Payment Helpdesk */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/50">
            <PhoneCall className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Payment Helpdesk</span>
              <span className="text-[11px] text-slate-500 leading-tight block">
                SBI: +91-022-65361671 | Axis: +91 1800-419-0073
              </span>
            </div>
          </div>

          {/* eVisa Helpdesk */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/50">
            <Phone className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">eVisa 24x7 Helpdesk</span>
              <span className="text-[11px] text-slate-600 leading-tight block font-medium">
                (+91) 82 7808 7808 | indian-evisa@gov.in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,

  // 10. useful-links.tsx
  'src/components/home/useful-links.tsx': `import React from "react";
import Link from "next/link";
import { ExternalLink, Building2, ArrowRight } from "lucide-react";
import { USEFUL_LINKS } from "@/content/homepage-data";

export function UsefulLinks() {
  return (
    <div className="portal-card p-6 sm:p-7 bg-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#0F172A] tracking-tight">
              Useful Links
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Government of India portals &amp; tourism resources
            </p>
          </div>
          <Link
            href="https://india.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#0B2A6F] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Links List */}
        <div className="space-y-2.5">
          {USEFUL_LINKS.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-200/70 hover:bg-blue-50/50 hover:border-blue-200 hover:text-[#0B2A6F] transition-all group text-decoration-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Building2 className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] shrink-0 transition-colors" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#0B2A6F] transition-colors truncate">
                  {link.title}
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
`,

  // 11. mobile-nav.tsx
  'src/components/layout/mobile-nav.tsx': `"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  FilePlus,
  Folder,
  Info,
  HelpCircle,
  X,
  ShieldCheck,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { SessionUser } from "@/types/auth";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: SessionUser | null;
  onLogout: () => void;
}

const NAV_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Applications", href: "/dashboard", icon: FolderOpen },
  { name: "New Application", href: "/dashboard?action=new", icon: FilePlus },
  { name: "Documents", href: "/dashboard#documents", icon: Folder },
  { name: "Visa Information", href: "/#categories", icon: Info },
  { name: "Help & Support", href: "/#help", icon: HelpCircle },
];

export function MobileNav({ isOpen, onClose, user, onLogout }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-label="Close navigation"
      />

      {/* Slide-out Drawer */}
      <aside className="relative flex flex-col w-4/5 max-w-xs bg-white h-full shadow-2xl z-10">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-[#0B2A6F] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
              GOI
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">eVisa Portal</div>
              <div className="text-[11px] text-slate-300">Government of India</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Mobile Menu */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0B2A6F] text-white font-bold text-sm flex items-center justify-center">
                {user.full_name
                  ? user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "HA"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-slate-900 truncate">
                  {user.full_name || "Husain Al-Mansoor"}
                </div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-[#0B2A6F] text-white text-sm font-semibold rounded-lg"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Portal</span>
            </Link>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-[#0B2A6F] font-semibold"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[#0B2A6F]" : "text-slate-500")} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Security & Logout Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure &amp; Official Government Service</span>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
`,

  // 12. header.tsx
  'src/components/layout/header.tsx': `"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderOpen,
  FilePlus,
  Folder,
  Info,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Menu,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { clearSession, getSession } from "@/lib/session";
import type { SessionUser } from "@/types/auth";
import { MobileNav } from "./mobile-nav";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Applications", href: "/dashboard", icon: FolderOpen },
  { name: "New Application", href: "/dashboard?action=new", icon: FilePlus },
  { name: "Documents", href: "/dashboard#documents", icon: Folder },
  { name: "Visa Information", href: "/#categories", icon: Info },
  { name: "Help & Support", href: "/#help", icon: HelpCircle },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [lastSignInTime, setLastSignInTime] = useState<string>("28 May 2026, 10:30 AM");

  useEffect(() => {
    const session = getSession();
    if (session?.user) {
      setUser(session.user);
    } else {
      // Default demo user identity for showcase if no session stored
      setUser({
        id: "demo-user-1",
        email: "husain.almansoor@example.com",
        full_name: "Husain Al-Mansoor",
      });
    }

    const now = new Date();
    setLastSignInTime(
      now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
        ", " +
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
    );
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "HA";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
        {/* Top Government Banner Row */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Left: Emblem + Portal Title */}
          <Link href="/" className="flex items-center gap-3.5 group text-decoration-none">
            <div className="relative w-9 h-12 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/assets/emblem.svg"
                alt="State Emblem of India"
                width={36}
                height={48}
                priority
                className="w-full h-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-[#0B2A6F] tracking-tight leading-none font-sans">
                  eVisa Portal
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide mt-0.5">
                Official Government of India
              </p>
            </div>
          </Link>

          {/* Right Section: Security Badge + User Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Security Pill (Desktop) */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="text-[11px] font-bold leading-tight text-emerald-900">
                  Secure &amp; Official
                </div>
                <div className="text-[10px] text-emerald-700 leading-tight">
                  Your data is protected
                </div>
              </div>
            </div>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left focus:outline-hidden"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-semibold text-slate-900 leading-tight flex items-center justify-end gap-1">
                      <span>{user.full_name || "Husain Al-Mansoor"}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Last signed in: {lastSignInTime}
                    </div>
                  </div>

                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0B2A6F] text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs border-2 border-white ring-1 ring-slate-200">
                    {getInitials(user.full_name)}
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      aria-label="Close menu"
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-sm animate-fadeIn">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="font-semibold text-slate-900 truncate">
                          {user.full_name || "Husain Al-Mansoor"}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#0B2A6F]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-[#0B2A6F]"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>Saved Profile Details</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Open navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Horizontal Navigation Row (Desktop/Tablet) */}
        <div className="hidden md:block border-t border-slate-200/80 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 lg:space-x-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isCurrent =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href.split("?")[0].split("#")[0]) &&
                      item.href !== "/";

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all text-decoration-none",
                      isCurrent
                        ? "border-[#0B2A6F] text-[#0B2A6F] font-semibold"
                        : "border-transparent text-slate-600 hover:text-[#0B2A6F] hover:border-slate-300"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        isCurrent ? "text-[#0B2A6F]" : "text-slate-500"
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Responsive Mobile Drawer */}
      <MobileNav
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}
`,

  // 13. footer.tsx
  'src/components/layout/footer.tsx': `import React from "react";
import Link from "next/link";
import { CheckCircle2, Lock, Globe, ChevronDown } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-16 bg-white border-t border-slate-200">
      {/* Upper Trust Badges Bar */}
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Badge 1: Official Service */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0B2A6F] shrink-0 border border-blue-100">
                <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-tight">
                  Official Government Service
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Trusted and Transparent
                </div>
              </div>
            </div>

            {/* Badge 2: Security & Encryption */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0B2A6F] shrink-0 border border-blue-100">
                <Lock className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-tight">
                  This is a secure government website
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Your data is protected with 256-bit encryption
                </div>
              </div>
            </div>

            {/* Badge 3: Digital India */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-100">
                <div className="font-extrabold text-xs tracking-tighter text-amber-800">
                  DI
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1">
                  <span>Digital India</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Power To Empower
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Legal & Language Bar */}
      <div className="bg-[#0B2A6F] text-slate-200 text-xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Legal Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-300">
            <Link
              href="#accessibility"
              className="hover:text-white transition-colors"
            >
              Accessibility
            </Link>
            <span className="text-slate-500">•</span>
            <Link href="#sitemap" className="hover:text-white transition-colors">
              Sitemap
            </Link>
            <span className="text-slate-500">•</span>
            <Link
              href="#privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-500">•</span>
            <Link href="#terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
          </nav>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors border border-white/15"
            >
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <span>English</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
`,

  // 14. postcss.config.mjs
  'postcss.config.mjs': `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.resolve(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  const size = fs.statSync(fullPath).size;
  console.log(\`Wrote \${relPath}: \${size} bytes\`);
}
console.log('All files written successfully.');


"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileEdit, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.12),_transparent_32%),linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_72%,#EEF4FF_100%)] py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-6 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#0B2A6F]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>Digital eVisa Portal</span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
              Apply for your Indian eVisa with a clearer guided workflow.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              A modern submission experience for applicant details, passport OCR, document uploads, and review-ready
              visa drafts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="btn-primary px-6 py-3 text-sm sm:text-base">
              <span>Start Application</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="btn-secondary px-5 py-3 text-sm sm:text-base">
              <FileEdit className="h-4 w-4 text-[#0B2A6F]" />
              <span>Resume Draft</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="portal-card p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workflow</div>
              <div className="mt-2 text-2xl font-bold text-[#0B2A6F]">5 Steps</div>
              <p className="mt-1 text-sm text-slate-600">Structured applicant journey from profile to submission.</p>
            </div>
            <div className="portal-card p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assistance</div>
              <div className="mt-2 text-2xl font-bold text-[#0B2A6F]">AI + OCR</div>
              <p className="mt-1 text-sm text-slate-600">Smart passport extraction and rule guidance.</p>
            </div>
            <div className="portal-card p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Security</div>
              <div className="mt-2 text-2xl font-bold text-[#0B2A6F]">Draft Safe</div>
              <p className="mt-1 text-sm text-slate-600">Resume progress later without losing application state.</p>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[16/11] w-full max-w-[500px] overflow-hidden rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_50px_-18px_rgba(15,23,42,0.28)] backdrop-blur">
            <div className="absolute inset-x-5 top-4 h-8 rounded-full bg-gradient-to-r from-orange-100 via-white to-green-100" />
            <Image
              src="/assets/Taj%20Mahal.png"
              alt="Indian eVisa portal hero illustration"
              fill
              priority
              className="object-contain p-8 pt-12"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

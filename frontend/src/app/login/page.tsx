import { LoginForm } from "@/components/auth/login-form";
import { ShieldCheck, Sparkles, Clock, FileCheck2 } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Government Information & Features */}
        <section className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0B2A6F] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Official Digital Service 2026</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight leading-tight">
              India Travel Application, modernized for clarity and speed.
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Access the official Indian eVisa service with an intelligent 5-step guided wizard, real-time OCR passport verification, automatic cloud-sync drafts, and an AI-powered rules assistant.
            </p>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-2">
            <div className="portal-card p-4 sm:p-5 bg-white">
              <div className="flex items-center gap-2.5 text-[#2563EB] mb-2">
                <FileCheck2 className="w-5 h-5" />
                <span className="text-xl sm:text-2xl font-bold text-[#0B2A6F]">5-Step</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 font-medium leading-snug block">
                Guided wizard with live progress tracking
              </span>
            </div>

            <div className="portal-card p-4 sm:p-5 bg-white">
              <div className="flex items-center gap-2.5 text-[#2563EB] mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-xl sm:text-2xl font-bold text-[#0B2A6F]">15s</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 font-medium leading-snug block">
                Dual autosave and offline resilience
              </span>
            </div>

            <div className="portal-card p-4 sm:p-5 bg-white">
              <div className="flex items-center gap-2.5 text-[#2563EB] mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xl sm:text-2xl font-bold text-[#0B2A6F]">AI + OCR</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 font-medium leading-snug block">
                Instant passport scanning &amp; rules assistance
              </span>
            </div>

            <div className="portal-card p-4 sm:p-5 bg-white">
              <div className="flex items-center gap-2.5 text-emerald-600 mb-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xl sm:text-2xl font-bold text-[#0B2A6F]">256-bit</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 font-medium leading-snug block">
                Encrypted official government submission
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Login Card */}
        <section className="lg:col-span-5">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}

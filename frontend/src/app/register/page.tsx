import { RegisterForm } from "@/components/auth/register-form";
import { ShieldCheck, Sparkles, Clock, FileCheck2 } from "lucide-react";

export const metadata = {
  title: "Create Account | Official Indian eVisa Portal",
  description:
    "Register for an official Indian eVisa account to create, manage, and submit electronic visa applications.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Government Information & Features */}
        <section className="space-y-6 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wider text-[#0B2A6F] uppercase">
            <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>Official Digital Service 2026</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl leading-tight">
              Register for the Indian eVisa Official Portal.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Create your secure applicant profile once to auto-fill future applications, enjoy seamless 15-second dual cloud autosave, and access 24/7 AI-guided visa compliance assistance.
            </p>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-2">
            <div className="portal-card bg-white p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2.5 text-[#2563EB]">
                <FileCheck2 className="h-5 w-5" />
                <span className="text-xl font-bold text-[#0B2A6F] sm:text-2xl">
                  5-Step
                </span>
              </div>
              <span className="block text-xs font-medium leading-snug text-slate-600 sm:text-sm">
                Guided wizard with live progress tracking
              </span>
            </div>

            <div className="portal-card bg-white p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2.5 text-[#2563EB]">
                <Clock className="h-5 w-5" />
                <span className="text-xl font-bold text-[#0B2A6F] sm:text-2xl">
                  15s
                </span>
              </div>
              <span className="block text-xs font-medium leading-snug text-slate-600 sm:text-sm">
                Dual autosave and offline resilience
              </span>
            </div>

            <div className="portal-card bg-white p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2.5 text-[#2563EB]">
                <Sparkles className="h-5 w-5" />
                <span className="text-xl font-bold text-[#0B2A6F] sm:text-2xl">
                  AI + OCR
                </span>
              </div>
              <span className="block text-xs font-medium leading-snug text-slate-600 sm:text-sm">
                Instant passport scanning &amp; rules assistance
              </span>
            </div>

            <div className="portal-card bg-white p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2.5 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xl font-bold text-[#0B2A6F] sm:text-2xl">
                  256-bit
                </span>
              </div>
              <span className="block text-xs font-medium leading-snug text-slate-600 sm:text-sm">
                Encrypted official government submission
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Register Card */}
        <section className="lg:col-span-5">
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}


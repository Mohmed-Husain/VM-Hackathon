"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import { VisaAssistantWidget } from "@/components/assistant/visa-assistant-widget";
import { ProtectedPage } from "@/components/auth/protected-page";
import { VISA_CATEGORIES } from "@/content/visa-categories";
import { createApplication, getApplications, getCurrentUser } from "@/lib/api";
import { getCategoryLabel } from "@/lib/application";
import { clearSession } from "@/lib/session";
import type { SessionUser, StoredSession } from "@/types/auth";
import type { ApplicationSummary, VisaCategory } from "@/types/application";

export function DashboardShell() {
  return (
    <ProtectedPage>{(session) => <DashboardContent session={session} />}</ProtectedPage>
  );
}

function DashboardContent({ session }: Readonly<{ session: StoredSession }>) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser>(session.user);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [creatingCategory, setCreatingCategory] = useState<VisaCategory | null>(null);

  const submittedCount = applications.filter((app) => app.status === "Submitted").length;
  const inProgressCount = applications.filter((app) => app.status !== "Submitted").length;
  const mostAdvancedApplication = applications.reduce<ApplicationSummary | null>((best, app) => {
    if (!best || app.progress_percentage > best.progress_percentage) {
      return app;
    }
    return best;
  }, null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const [user, userApplications] = await Promise.all([
          getCurrentUser(session.accessToken),
          getApplications(session.accessToken),
        ]);
        if (!cancelled) {
          setCurrentUser(user);
          setApplications(userApplications);
        }
      } catch (authError) {
        if (!cancelled) {
          const message = authError instanceof Error ? authError.message : "Session verification failed.";
          setError(message);

          if (message.toLowerCase().includes("authentication")) {
            clearSession();
            router.replace("/login");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [session.accessToken, router]);

  async function handleCreateApplication(visaCategory: VisaCategory) {
    try {
      setCreatingCategory(visaCategory);
      setError("");
      const created = await createApplication(session.accessToken, {
        visa_category: visaCategory,
      });
      startTransition(() => {
        router.push(`/applications/${created.application_id}`);
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create the application.");
    } finally {
      setCreatingCategory(null);
    }
  }

  function handleResume(applicationId: string) {
    startTransition(() => {
      router.push(`/applications/${applicationId}`);
    });
  }

  return (
    <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Welcome Banner */}
      <section className="portal-card p-6 sm:p-8 bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B2A6F] text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Official eVisa Applicant Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Welcome back, {currentUser.full_name}.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Track draft progress, resume incomplete applications, and seal submissions directly through the guided eVisa workflow.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* 4 Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Account Status</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">{currentUser.email}</div>
            <span className="text-[11px] text-emerald-700 font-medium">Verified Applicant</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Active Drafts</span>
              <Clock className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B2A6F]">
              {isLoading ? "-" : inProgressCount}
            </div>
            <span className="text-[11px] text-slate-500">Drafts you can resume</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
              <span>Submitted</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B2A6F]">
              {isLoading ? "-" : submittedCount}
            </div>
            <span className="text-[11px] text-slate-500">Sealed applications</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center justify-between text-[#0B2A6F] text-xs font-semibold mb-1">
              <span>Highest Progress</span>
              <TrendingUp className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B2A6F]">
              {mostAdvancedApplication ? `${mostAdvancedApplication.progress_percentage}%` : "0%"}
            </div>
            <span className="text-[11px] text-slate-600 truncate block">
              {mostAdvancedApplication ? getCategoryLabel(mostAdvancedApplication.visa_category) : "Start new draft"}
            </span>
          </div>
        </div>
      </section>

      {/* Active Applications Section */}
      <section className="portal-card p-6 sm:p-8 bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
              My Active Applications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Resume your saved visa draft or view submitted application summaries
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            Syncing application data...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-10 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300 p-6">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No applications found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You do not have any active visa applications. Start a new draft using the categories below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => (
              <div
                key={app.application_id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A]">
                        {getCategoryLabel(app.visa_category)}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Updated {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(app.updated_at))}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        app.status === "Submitted"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "Review Ready"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-50 text-[#0B2A6F]"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 my-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#0B2A6F]">{app.progress_percentage}% complete</span>
                      <span className="text-slate-500 font-normal">
                        {app.status === "Submitted" ? "Sealed" : `Step ${app.current_step} of 5`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#0B2A6F] rounded-full transition-all duration-300"
                        style={{ width: `${app.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleResume(app.application_id)}
                  className="btn-primary w-full py-2.5 text-xs font-semibold mt-2 justify-center"
                >
                  <span>{app.status === "Submitted" ? "View Submission" : "Resume Application"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Start New Application Section */}
      <section className="portal-card p-6 sm:p-8 bg-white border border-slate-200">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
            Start a New Application
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a visa product to initialize a new official application draft
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {VISA_CATEGORIES.map((category) => (
            <div
              key={category.value}
              className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm sm:text-base text-[#0F172A]">
                    {category.title}
                  </h3>
                  <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {category.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  {category.description}
                </p>
                <div className="mt-3 text-xs font-bold text-[#0B2A6F]">
                  {category.feeLabel}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCreateApplication(category.value)}
                disabled={creatingCategory !== null}
                className="btn-secondary w-full py-2.5 text-xs font-semibold mt-4 justify-center"
              >
                <Plus className="w-3.5 h-3.5 text-[#0B2A6F]" />
                <span>{creatingCategory === category.value ? "Initializing..." : "Start Application"}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Floating AI Assistant */}
      <VisaAssistantWidget accessToken={session.accessToken} />
    </main>
  );
}

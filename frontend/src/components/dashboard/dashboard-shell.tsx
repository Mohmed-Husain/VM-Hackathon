"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [authStatus, setAuthStatus] = useState("Loading applications");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [creatingCategory, setCreatingCategory] = useState<VisaCategory | null>(null);

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
          setAuthStatus("Authenticated and synced with backend");
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
  }, [session.accessToken]);

  function handleSignOut() {
    clearSession();
    router.replace("/login");
  }

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
    <main className="app-shell">
      <div className="page-frame dashboard-layout">
        <section className="content-panel">
          <div className="topbar">
            <div>
              <span className="eyebrow">Module 3</span>
              <h1 className="card-title">Welcome back, {currentUser.full_name}.</h1>
              <p className="card-copy">
                Your dashboard now pulls real application data from FastAPI so we can create new drafts and resume the
                seeded application journey.
              </p>
            </div>
            <button className="secondary-button" type="button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
          {error ? <div className="banner-error">{error}</div> : null}
          <div className="status-chip">
            <span className="status-dot" />
            {error ? "Using cached session" : authStatus}
          </div>
        </section>

        <section className="detail-grid">
          <article className="detail-card">
            <strong>Authenticated Applicant</strong>
            <span className="subtle">{currentUser.email}</span>
          </article>
          <article className="detail-card">
            <strong>Application APIs</strong>
            <span className="subtle">GET /applications, POST /applications, GET /applications/:applicationId</span>
          </article>
          <article className="detail-card">
            <strong>Resume State</strong>
            <span className="subtle">{isLoading ? "Syncing draft data" : `${applications.length} application(s) found`}</span>
          </article>
        </section>

        <section className="content-panel">
          <span className="eyebrow">Active applications</span>
          <h2 className="card-title">Resume or start a new visa application</h2>
          {isLoading ? <p className="subtle">Loading your application list...</p> : null}
          {!isLoading && applications.length === 0 ? (
            <div className="empty-panel">
              <strong>No applications yet</strong>
              <p className="subtle">This account has a clean slate. Start with one of the simplified MVP visa categories below.</p>
            </div>
          ) : null}
          <div className="application-card-grid">
            {applications.map((application) => (
              <article className="application-card" key={application.application_id}>
                <div className="application-card-top">
                  <div>
                    <strong>{getCategoryLabel(application.visa_category)}</strong>
                    <p className="card-copy small">
                      Last updated {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(application.updated_at))}
                    </p>
                  </div>
                  <span className="status-chip compact-chip">
                    <span className="status-dot" />
                    {application.status}
                  </span>
                </div>
                <div className="progress-wrap compact-progress">
                  <div className="progress-meta">
                    <strong>{application.progress_percentage}% complete</strong>
                    <span className="subtle">Resume at step {application.current_step}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${application.progress_percentage}%` }} />
                  </div>
                </div>
                <button
                  className="primary-button inline"
                  type="button"
                  onClick={() => handleResume(application.application_id)}
                >
                  Resume application
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="content-panel">
          <span className="eyebrow">Create application</span>
          <h2 className="card-title">Start a new draft</h2>
          <div className="application-card-grid">
            {VISA_CATEGORIES.map((category) => (
              <article className="category-card" key={category.value}>
                <div>
                  <strong>{category.title}</strong>
                  <p className="card-copy small">{category.duration}</p>
                </div>
                <p className="subtle">{category.description}</p>
                <div className="category-meta">
                  <span className="status-chip compact-chip">
                    <span className="status-dot status-dot-warm" />
                    {category.feeLabel}
                  </span>
                </div>
                <button
                  className="primary-button inline"
                  type="button"
                  onClick={() => handleCreateApplication(category.value)}
                  disabled={creatingCategory !== null}
                >
                  {creatingCategory === category.value ? "Creating..." : "Start this application"}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

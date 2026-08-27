import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="app-shell">
      <div className="page-frame hero-grid">
        <section className="hero-panel">
          <span className="brand-kicker">Smart eVisa Portal MVP</span>
          <h1 className="headline">India travel application, rebuilt to feel clear and calm.</h1>
          <p className="lead">
            This prototype keeps the official flow recognizable while reducing friction for first-time applicants.
            We are starting with secure demo access, a guided dashboard shell, and a platform foundation built for
            iterative module delivery.
          </p>
          <div className="metric-card">
            <article className="metric-tile">
              <span className="metric-value">2</span>
              <span className="metric-label">Seeded demo applicants</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">15s</span>
              <span className="metric-label">Target autosave cadence in upcoming modules</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">5-step</span>
              <span className="metric-label">Application wizard planned next</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">Async</span>
              <span className="metric-label">FastAPI + SQLAlchemy backend foundation</span>
            </article>
          </div>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}

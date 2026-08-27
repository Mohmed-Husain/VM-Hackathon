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
            It now includes a guided five-step wizard, OCR-assisted passport capture, sealed submissions, and a
            grounded visa assistant while keeping payments hidden for the MVP demo.
          </p>
          <div className="metric-card">
            <article className="metric-tile">
              <span className="metric-value">12</span>
              <span className="metric-label">Implemented MVP modules</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">15s</span>
              <span className="metric-label">Dual autosave cadence</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">5-step</span>
              <span className="metric-label">Wizard with review and submission</span>
            </article>
            <article className="metric-tile">
              <span className="metric-value">AI + OCR</span>
              <span className="metric-label">Grounded guidance and simulated extraction</span>
            </article>
          </div>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}

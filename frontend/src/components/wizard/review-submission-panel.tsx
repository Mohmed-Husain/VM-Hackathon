"use client";

import { PaymentPlaceholderPanel } from "@/components/wizard/payment-placeholder-panel";

export type ReviewSectionItem = {
  label: string;
  value: string;
};

export type ReviewSection = {
  step: number;
  title: string;
  description: string;
  isComplete: boolean;
  items: ReviewSectionItem[];
};

export function ReviewSubmissionPanel({
  sections,
  isReviewReady,
  declarationAccepted,
  declarationError,
  readinessError,
  isSubmitting,
  isSubmitted,
  submittedAt,
  onEditStep,
  onDeclarationBlur,
  onDeclarationChange,
  onSubmit,
}: Readonly<{
  sections: ReviewSection[];
  isReviewReady: boolean;
  declarationAccepted: boolean;
  declarationError?: string;
  readinessError?: string;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submittedAt?: string | null;
  onEditStep: (step: number) => void;
  onDeclarationBlur: () => void;
  onDeclarationChange: (nextValue: boolean) => void;
  onSubmit: () => void;
}>) {
  return (
    <div className="review-experience">
      <div className="review-hero-card">
        <div>
          <span className="eyebrow">Module 11</span>
          <h3 className="card-title">Review, declare, and seal this application</h3>
          <p className="card-copy">
            Double-check the draft below. Once submitted, the application becomes read-only and keeps a sealed snapshot.
          </p>
        </div>
        <div className="review-hero-statuses">
          <div className={`review-signal ${isReviewReady ? "is-complete" : "is-pending"}`}>
            <strong>{isReviewReady ? "Ready for submission" : "Needs attention"}</strong>
            <span>{isReviewReady ? "All prior steps are complete." : "One or more earlier steps still need work."}</span>
          </div>
          <div className={`review-signal ${isSubmitted ? "is-complete" : "is-pending"}`}>
            <strong>{isSubmitted ? "Application sealed" : "Submission pending"}</strong>
            <span>
              {isSubmitted && submittedAt
                ? `Submitted on ${formatDateTime(submittedAt)}.`
                : "Payment stays hidden in this MVP, so submission completes without checkout."}
            </span>
          </div>
        </div>
      </div>

      <div className="review-accordion-grid">
        {sections.map((section) => (
          <details key={section.step} className="review-section" open={section.step <= 2}>
            <summary className="review-section-summary">
              <div>
                <span className="review-step-label">Step {section.step}</span>
                <strong>{section.title}</strong>
                <span className="subtle">{section.description}</span>
              </div>
              <span className={`status-chip compact-chip ${section.isComplete ? "status-chip-success" : "status-chip-pending"}`}>
                <span className={`status-dot ${section.isComplete ? "" : "status-dot-warm"}`} />
                {section.isComplete ? "Complete" : "Needs review"}
              </span>
            </summary>
            <div className="review-section-body">
              <div className="review-item-grid">
                {section.items.map((item) => (
                  <div className="review-item" key={`${section.step}-${item.label}`}>
                    <span className="review-item-label">{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              {!isSubmitted ? (
                <button className="secondary-button inline" type="button" onClick={() => onEditStep(section.step)}>
                  Edit this step
                </button>
              ) : null}
            </div>
          </details>
        ))}
      </div>

      <label className={`declaration-card ${isSubmitted ? "is-submitted" : ""}`}>
        <div className="declaration-check">
          <input
            type="checkbox"
            checked={declarationAccepted}
            disabled={isSubmitted}
            onBlur={onDeclarationBlur}
            onChange={(event) => onDeclarationChange(event.target.checked)}
          />
        </div>
        <div>
          <strong>Applicant declaration</strong>
          <p className="card-copy small">
            I confirm that the personal, passport, travel, and document details in this application are accurate to the
            best of my knowledge and are ready to be sealed.
          </p>
          {declarationError ? <span className="error-text">{declarationError}</span> : null}
          {readinessError ? <span className="error-text">{readinessError}</span> : null}
        </div>
      </label>

      <div className="helper-box">
        <strong>Payment is intentionally hidden</strong>
        The payment step is preserved as a later module, but it remains out of the visible applicant flow for now.
      </div>

      <PaymentPlaceholderPanel />

      {!isSubmitted ? (
        <div className="submission-actions">
          <div className="subtle">
            Submitting now will seal the current draft snapshot and move the application to a read-only submitted state.
          </div>
          <button className="primary-button inline submit-button" type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Seal and submit application"}
          </button>
        </div>
      ) : (
        <div className="submission-success-banner">
          <strong>Application submitted successfully</strong>
          <span>{submittedAt ? `Sealed on ${formatDateTime(submittedAt)}.` : "The sealed snapshot is now read-only."}</span>
        </div>
      )}
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

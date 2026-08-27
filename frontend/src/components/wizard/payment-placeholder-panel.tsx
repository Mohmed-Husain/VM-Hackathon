const SHOW_PAYMENT_PLACEHOLDER = process.env.NEXT_PUBLIC_SHOW_PAYMENT_PLACEHOLDER === "true";

export function PaymentPlaceholderPanel() {
  if (!SHOW_PAYMENT_PLACEHOLDER) {
    return null;
  }

  return (
    <article className="payment-placeholder-panel">
      <div className="payment-placeholder-top">
        <div>
          <span className="eyebrow">Module 12</span>
          <strong>Payment gateway placeholder</strong>
          <p className="card-copy small">
            This internal panel is hidden by default and only appears when the payment placeholder flag is enabled.
          </p>
        </div>
        <span className="status-chip compact-chip">
          <span className="status-dot status-dot-warm" />
          Coming soon
        </span>
      </div>
      <div className="payment-placeholder-grid">
        <div className="payment-method-chip">Card</div>
        <div className="payment-method-chip">UPI</div>
        <div className="payment-method-chip">Net Banking</div>
      </div>
      <p className="subtle">
        The visible applicant flow still hides checkout while we finish the submission and payment modules separately.
      </p>
    </article>
  );
}

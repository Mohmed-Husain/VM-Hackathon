"use client";

import { PaymentGateway } from "@/components/payment/payment-gateway";

interface PaymentPlaceholderPanelProps {
  applicationId?: string;
  accessToken?: string;
  feeAmount?: number;
  onPaymentSuccess?: () => void;
}

export function PaymentPlaceholderPanel({
  applicationId,
  accessToken,
  feeAmount = 50,
  onPaymentSuccess,
}: PaymentPlaceholderPanelProps) {
  if (!applicationId || !accessToken) {
    return null;
  }

  return (
    <div className="my-6">
      <PaymentGateway
        applicationId={applicationId}
        accessToken={accessToken}
        feeAmount={feeAmount}
        onPaymentSuccess={onPaymentSuccess}
      />
    </div>
  );
}

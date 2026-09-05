export type PaymentMethod =
  | "visa"
  | "mastercard"
  | "amex"
  | "paypal"
  | "upi"
  | "debit";

export interface PaymentAttemptRequest {
  application_id: string;
  payment_method: PaymentMethod;
  card_last_four?: string | null;
  amount_usd: number;
}

export interface PaymentAttemptResponse {
  status: "success" | "failed" | "locked";
  failure_reason: string | null;
  attempt_number: number;
  attempts_remaining: number;
  locked_until: string | null;
}

export interface LockStatusResponse {
  is_locked: boolean;
  locked_until: string | null;
  failed_attempts: number;
}


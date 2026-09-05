"use client";

import { useEffect, useRef, useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Zap,
  Building,
  Smartphone,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { attemptPayment, devSkipPaymentLock, getPaymentLockStatus } from "@/lib/api";
import type { PaymentMethod } from "@/types/payment";

interface PaymentGatewayProps {
  applicationId: string;
  accessToken: string;
  feeAmount?: number;
  onPaymentSuccess?: () => void;
}

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  name: string;
  badge: string;
  icon: typeof CreditCard;
  description: string;
}> = [
  { id: "visa", name: "Visa", badge: "Instant", icon: CreditCard, description: "International & domestic cards" },
  { id: "mastercard", name: "Mastercard", badge: "Instant", icon: CreditCard, description: "Debit & credit cards" },
  { id: "amex", name: "American Express", badge: "Secure", icon: CreditCard, description: "Global Amex network" },
  { id: "paypal", name: "PayPal", badge: "Global", icon: Globe, description: "International wallet checkout" },
  { id: "upi", name: "UPI / QR", badge: "Fastest", icon: Smartphone, description: "GooglePay, PhonePe, Paytm" },
  { id: "debit", name: "Intl. Debit", badge: "Direct", icon: Building, description: "Direct bank debit" },
];

export function PaymentGateway({
  applicationId,
  accessToken,
  feeAmount = 50,
  onPaymentSuccess,
}: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("visa");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [cardHolder, setCardHolder] = useState("RAHUL KUMAR");
  const [upiId, setUpiId] = useState("applicant@upi");

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed" | "locked">("idle");
  const [processingStage, setProcessingStage] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [lastUsedCardMasked, setLastUsedCardMasked] = useState<string | null>(null);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check initial lock status on mount
  useEffect(() => {
    async function checkLock() {
      try {
        const lockRes = await getPaymentLockStatus(accessToken, applicationId);
        if (lockRes.is_locked && lockRes.locked_until) {
          setStatus("locked");
          setLockedUntil(lockRes.locked_until);
          setAttemptsRemaining(0);
        } else if (lockRes.failed_attempts > 0) {
          setAttemptsRemaining(Math.max(0, 3 - lockRes.failed_attempts));
        }
      } catch {
        // ignore lock check errors
      }
    }
    if (applicationId && accessToken) {
      void checkLock();
    }
  }, [applicationId, accessToken]);

  // Countdown timer logic when locked
  useEffect(() => {
    if (status !== "locked" || !lockedUntil) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(lockedUntil).getTime();
      const diff = Math.max(0, target - now);

      if (diff <= 0) {
        setStatus("idle");
        setAttemptsRemaining(3);
        setLockedUntil(null);
        setCountdown("");
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, "0");
      setCountdown(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateTimer();
    countdownIntervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [status, lockedUntil]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "locked" || status === "processing") return;

    setStatus("processing");
    setProcessingStage(0);

    const cleanCard = cardNumber.replace(/\s/g, "");
    const lastFour = cleanCard.length >= 4 ? cleanCard.slice(-4) : "4242";
    setLastUsedCardMasked(`${selectedMethod.toUpperCase()} •••• ${lastFour}`);

    // Multi-stage animated progress
    setTimeout(() => setProcessingStage(1), 1000);
    setTimeout(() => setProcessingStage(2), 2200);

    // Make backend call after 3.2s simulation
    setTimeout(async () => {
      try {
        const res = await attemptPayment(accessToken, {
          application_id: applicationId,
          payment_method: selectedMethod,
          card_last_four: lastFour,
          amount_usd: feeAmount,
        });

        if (res.status === "success") {
          setStatus("success");
          onPaymentSuccess?.();
        } else if (res.status === "locked") {
          setStatus("locked");
          setLockedUntil(res.locked_until);
          setAttemptsRemaining(0);
          setFailureReason(res.failure_reason);
        } else {
          setStatus("failed");
          setAttemptsRemaining(res.attempts_remaining);
          setFailureReason(res.failure_reason);
        }
      } catch (err) {
        setStatus("failed");
        setAttemptsRemaining((prev) => Math.max(0, prev - 1));
        setFailureReason(err instanceof Error ? err.message : "Network error processing transaction.");
      }
    }, 3200);
  };

  const handleDevSkip = async () => {
    try {
      await devSkipPaymentLock(accessToken, applicationId);
      setStatus("idle");
      setAttemptsRemaining(3);
      setLockedUntil(null);
      setCountdown("");
      setFailureReason(null);
    } catch {
      setStatus("idle");
      setAttemptsRemaining(3);
      setLockedUntil(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#0B2A6F]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
            Government Payment Gateway
          </div>
          <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
            Visa Application Fee
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-slate-500">Amount Due</span>
          <p className="text-2xl font-extrabold text-[#0B2A6F]">${feeAmount}.00 <span className="text-xs font-normal text-slate-500">USD</span></p>
        </div>
      </div>

      {/* STATE 1: PROCESSING ANIMATION */}
      {status === "processing" && (
        <div className="my-8 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-200 opacity-60" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#0B2A6F] text-white shadow-md">
              <Lock className="h-7 w-7 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">
              {processingStage === 0 && "Connecting to secure banking network..."}
              {processingStage === 1 && "Verifying 3D-Secure credentials..."}
              {processingStage === 2 && "Settling official consular transaction..."}
            </h4>
            <p className="text-xs text-slate-500">
              Please do not refresh or close this window. 256-bit encryption active.
            </p>
          </div>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-[#2563EB] transition-all duration-700 ease-out"
              style={{ width: `${(processingStage + 1) * 33}%` }}
            />
          </div>
        </div>
      )}

      {/* STATE 2: SUCCESS */}
      {status === "success" && (
        <div className="my-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h4 className="mt-3 text-lg font-bold text-emerald-950">
            Payment Verified &amp; Confirmed!
          </h4>
          <p className="mt-1 text-xs text-emerald-700 sm:text-sm">
            Transaction settled successfully. Your receipt ID has been registered with the Ministry of External Affairs.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3.5 py-1.5 text-xs font-mono font-semibold text-emerald-800">
            <span>REF: IND-VISA-{applicationId.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* STATE 3: LOCKED OUT (3-FAIL LOCKOUT) */}
      {status === "locked" && (
        <div className="my-5 rounded-xl border border-amber-300 bg-amber-50/80 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-amber-950">
                Payment Temporarily Locked
              </h4>
              <p className="mt-0.5 text-xs text-amber-800 sm:text-sm">
                For security reasons, after 3 unsuccessful attempts, online transactions are locked for 24 hours.
              </p>

              {/* Countdown Timer Display */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-900">Try again in:</span>
                <span className="rounded-md bg-amber-900 px-3 py-1 font-mono text-sm font-bold text-amber-100 shadow-xs">
                  {countdown || "23:59:58"}
                </span>
              </div>

              {/* Dev Skip Button */}
              <div className="mt-4 flex items-center gap-3 border-t border-amber-200 pt-3">
                <button
                  type="button"
                  onClick={handleDevSkip}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-900"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  Skip 24 Hours (Dev Demo Mode)
                </button>
                <span className="text-[11px] text-amber-700">
                  Instant lock reset for evaluators.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: FAILED ATTEMPT (PRESERVE PAYMENT PROGRESS) */}
      {status === "failed" && (
        <div className="my-5 rounded-xl border border-rose-200 bg-rose-50/80 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-rose-950">
                  Payment Attempt Unsuccessful
                </h4>
                <span className="inline-flex items-center rounded-full bg-rose-200/80 px-2 py-0.5 text-[11px] font-bold text-rose-900">
                  Remaining attempts: {attemptsRemaining} of 3
                </span>
              </div>
              <p className="mt-1 text-xs text-rose-800">
                {failureReason ?? "Your card issuer declined the transaction."}
              </p>

              {/* Preserved details indicator */}
              {lastUsedCardMasked && (
                <div className="mt-2.5 rounded-lg border border-rose-200 bg-white/90 p-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span><strong>Saved Details:</strong> {lastUsedCardMasked}</span>
                    <span className="font-medium text-emerald-700">Details Preserved ✓</span>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="inline-flex items-center gap-1 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT ENTRY FORM (IDLE OR RETRY) */}
      {(status === "idle" || status === "failed") && (
        <form onSubmit={handlePaySubmit} className="mt-5 space-y-5">
          {/* Method Selection 3x2 Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethod === method.id;
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-[#2563EB] bg-blue-50/50 shadow-xs ring-2 ring-[#2563EB]/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-[#2563EB]" : "text-slate-500"}`} />
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          isSelected
                            ? "bg-[#2563EB] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {method.badge}
                      </span>
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-900">{method.name}</span>
                    <span className="mt-0.5 text-[11px] text-slate-500 leading-tight">
                      {method.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Input Form (for card methods) */}
          {["visa", "mastercard", "amex", "debit"].includes(selectedMethod) && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm font-mono tracking-wider text-slate-900 focus:border-[#0B2A6F] focus:outline-hidden focus:ring-2 focus:ring-[#0B2A6F]/10"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Tip: End with <code className="font-mono font-bold text-emerald-700">4242</code> for success, <code className="font-mono font-bold text-rose-700">0000</code> to trigger fail/lockout.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Expiration (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-[#0B2A6F] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    CVV / Security Code
                  </label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-[#0B2A6F] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="NAME AS ON CARD"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase text-slate-900 focus:border-[#0B2A6F] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* UPI Form */}
          {selectedMethod === "upi" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Virtual Payment Address (UPI ID)
              </label>
              <div className="relative">
                <Smartphone className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or name@okaxis"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 focus:border-[#0B2A6F] focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                A collect request will be sent to your UPI application for instant verification.
              </p>
            </div>
          )}

          {/* PayPal Form */}
          {selectedMethod === "paypal" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
              <p className="text-xs text-slate-700 font-medium">
                You will be securely routed through the official consular PayPal settlement bridge.
              </p>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2A6F] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#081E4F] focus:outline-hidden focus:ring-2 focus:ring-[#0B2A6F]/20"
          >
            <Lock className="h-4 w-4" />
            <span>Pay ${feeAmount}.00 USD &amp; Verify Application</span>
          </button>

          {/* Trust badges footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 font-medium">
              <Lock className="h-3 w-3 text-emerald-600" />
              256-Bit SSL Encrypted
            </span>
            <span>Attempt {4 - attemptsRemaining} of 3</span>
            <span className="font-semibold text-slate-600">PCI DSS Level 1 Certified</span>
          </div>
        </form>
      )}
    </div>
  );
}


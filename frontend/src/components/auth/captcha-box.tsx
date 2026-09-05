"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { generateCaptcha } from "@/lib/api";

type CaptchaBoxProps = {
  challengeId: string;
  answer: string;
  onChallengeChange: (challengeId: string) => void;
  onAnswerChange: (answer: string) => void;
  error?: string;
  disabled?: boolean;
};

export function CaptchaBox({
  challengeId,
  answer,
  onChallengeChange,
  onAnswerChange,
  error,
  disabled,
}: CaptchaBoxProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchNewCaptcha = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const challenge = await generateCaptcha();
      setImageBase64(challenge.image_base64);
      onChallengeChange(challenge.challenge_id);
      onAnswerChange("");
    } catch {
      setFetchError("Failed to load security code. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!challengeId) {
      void fetchNewCaptcha();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="captcha-input"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          <ShieldCheck className="h-4 w-4 text-[#0B2A6F]" />
          Security Verification
        </label>
        <button
          type="button"
          onClick={fetchNewCaptcha}
          disabled={isLoading || disabled}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#0B2A6F] disabled:opacity-50"
          title="Get a new security code"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Code
        </button>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Captcha Image Container */}
        <div className="relative flex h-14 min-w-[190px] items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xs">
          {isLoading ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
              Generating code...
            </div>
          ) : imageBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageBase64}
              alt="Security verification code"
              className="h-full w-full object-contain select-none"
            />
          ) : (
            <span className="text-xs text-rose-600">
              {fetchError ?? "Security code unavailable"}
            </span>
          )}
        </div>

        {/* Input Field */}
        <div className="flex-1">
          <input
            id="captcha-input"
            type="text"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value.toUpperCase().slice(0, 8))}
            disabled={disabled || isLoading}
            placeholder="Enter code above"
            maxLength={8}
            autoComplete="off"
            spellCheck="false"
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-semibold tracking-widest text-slate-900 uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                : "border-slate-300 focus:border-[#0B2A6F] focus:ring-[#0B2A6F]/10"
            }`}
          />
        </div>
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : (
        <p className="text-[11px] text-slate-500">
          Enter the characters shown in the image above (not case-sensitive).
        </p>
      )}
    </div>
  );
}


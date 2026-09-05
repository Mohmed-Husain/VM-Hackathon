"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, UserPlus } from "lucide-react";
import { register } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { CaptchaBox } from "./captcha-box";

type FormState = {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  captcha_challenge_id: string;
  captcha_answer: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    captcha_challenge_id: "",
    captcha_answer: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.full_name.trim()) {
      nextErrors.full_name = "Full name is required as per your passport.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (form.password !== form.confirm_password) {
      nextErrors.confirm_password = "Passwords do not match.";
    }

    if (!form.captcha_answer.trim()) {
      nextErrors.captcha_answer = "Please enter the security verification code.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
        captcha_challenge_id: form.captcha_challenge_id,
        captcha_answer: form.captcha_answer.trim(),
      });

      saveSession(response);
      router.push("/dashboard");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
      // Reset captcha answer so user can retry with a fresh code
      setForm((prev) => ({ ...prev, captcha_answer: "" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0B2A6F]">
          <UserPlus className="h-3.5 w-3.5" />
          Applicant Registration
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create eVisa Account
        </h2>
        <p className="text-xs text-slate-600 sm:text-sm">
          Register to begin or manage official Indian eVisa applications.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 sm:text-sm">
          <p className="font-semibold text-rose-900">Registration Error</p>
          <p className="mt-0.5">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="full_name"
            className="block text-xs font-medium text-slate-700"
          >
            Full Name (as on Passport) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              id="full_name"
              type="text"
              value={form.full_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="e.g. Rahul Kumar"
              className={`w-full rounded-xl border bg-white py-2.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                errors.full_name
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-[#0B2A6F] focus:ring-[#0B2A6F]/10"
              }`}
            />
          </div>
          {errors.full_name && (
            <p className="text-xs text-rose-600">{errors.full_name}</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-slate-700"
          >
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="applicant@example.com"
              className={`w-full rounded-xl border bg-white py-2.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                errors.email
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-[#0B2A6F] focus:ring-[#0B2A6F]/10"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-600">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-slate-700"
          >
            Password <span className="text-rose-500">*</span> (min. 8 characters)
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                errors.password
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-[#0B2A6F] focus:ring-[#0B2A6F]/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-rose-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirm_password"
            className="block text-xs font-medium text-slate-700"
          >
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirm_password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, confirm_password: e.target.value }))
              }
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-white py-2.5 pr-10 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 ${
                errors.confirm_password
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-[#0B2A6F] focus:ring-[#0B2A6F]/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-xs text-rose-600">{errors.confirm_password}</p>
          )}
        </div>

        {/* CAPTCHA Security Verification */}
        <CaptchaBox
          challengeId={form.captcha_challenge_id}
          answer={form.captcha_answer}
          onChallengeChange={(id) =>
            setForm((prev) => ({ ...prev, captcha_challenge_id: id }))
          }
          onAnswerChange={(ans) =>
            setForm((prev) => ({ ...prev, captcha_answer: ans }))
          }
          error={errors.captcha_answer}
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2A6F] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#081E4F] focus:outline-hidden focus:ring-2 focus:ring-[#0B2A6F]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create eVisa Account
            </>
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600 sm:text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#2563EB] hover:text-[#0B2A6F] hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}


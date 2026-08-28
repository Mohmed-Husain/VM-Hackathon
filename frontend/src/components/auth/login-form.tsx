"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle, KeyRound, Mail } from "lucide-react";

import { login } from "@/lib/api";
import { saveSession } from "@/lib/session";

type FormState = {
  email: string;
  password: string;
};

type ValidationState = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  email: "applicant@example.com",
  password: "password123",
};

function validate(form: FormState): ValidationState {
  const nextErrors: ValidationState = {};

  if (!form.email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!form.password.trim()) {
    nextErrors.password = "Password is required.";
  }

  return nextErrors;
}

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ValidationState>({});
  const [serverError, setServerError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await login(form);
      saveSession(response);
      router.push("/dashboard");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="portal-card p-6 sm:p-8 bg-white shadow-lg border border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
          Sign In to eVisa Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Access your active applications, saved profile, and official travel documents.
        </p>
      </div>

      {serverError ? (
        <div className="p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                errors.email ? "border-rose-400 bg-rose-50/30" : "border-slate-300 bg-[#F8FAFC]"
              } text-[#0F172A] focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </div>
          {errors.email ? <span className="text-xs text-rose-600 font-medium mt-1 block">{errors.email}</span> : null}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                errors.password ? "border-rose-400 bg-rose-50/30" : "border-slate-300 bg-[#F8FAFC]"
              } text-[#0F172A] focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </div>
          {errors.password ? <span className="text-xs text-rose-600 font-medium mt-1 block">{errors.password}</span> : null}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 mt-2 text-sm sm:text-base font-semibold shadow-md disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          <span>{isSubmitting ? "Signing in..." : "Sign in to Account"}</span>
        </button>
      </form>

      {/* Seeded Demo Helper */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <span>Seeded Demo Credentials:</span>
        </div>
        <div className="font-mono bg-white p-2 rounded-lg border border-slate-200 select-all space-y-0.5">
          <div><strong className="text-slate-700">Account 1:</strong> applicant@example.com / password123</div>
          <div><strong className="text-slate-700">Account 2:</strong> maya.traveler@example.com / demo2026!</div>
        </div>
      </div>
    </div>
  );
}

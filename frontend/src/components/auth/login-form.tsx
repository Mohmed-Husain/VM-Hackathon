"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
    <section className="auth-card">
      <h2 className="card-title">Sign in to the demo portal</h2>
      <p className="card-copy">Use one of the seeded applicants to enter the dashboard and verify the auth module.</p>
      {serverError ? <div className="banner-error">{serverError}</div> : null}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            className="text-input"
            type="email"
            autoComplete="email"
            value={form.email}
            data-invalid={Boolean(errors.email)}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          {errors.email ? <span className="error-text">{errors.email}</span> : null}
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            className="text-input"
            type="password"
            autoComplete="current-password"
            value={form.password}
            data-invalid={Boolean(errors.password)}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          {errors.password ? <span className="error-text">{errors.password}</span> : null}
        </div>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="helper-box">
        <strong>Seeded demo accounts</strong>
        `applicant@example.com / password123`
        <br />
        `maya.traveler@example.com / demo2026!`
      </div>
    </section>
  );
}

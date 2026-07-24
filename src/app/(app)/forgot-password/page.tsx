"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/site/Logo";
import BackToHomeLink from "@/components/site/BackToHomeLink";
import { forgotPassword, ApiError } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-6">
      <BackToHomeLink />
      <div
        aria-hidden="true"
        className="animate-drift-a pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-primary-light/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift-b pointer-events-none absolute -bottom-32 -left-20 h-[380px] w-[380px] rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo className="h-10 w-10" />
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-ink">Reset your password</h1>
            <p className="mt-1 text-sm text-ink-soft">We&apos;ll email you a link to choose a new one</p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-7 shadow-lg shadow-ink/5">
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-ink">
                If an account exists for <span className="font-semibold">{email}</span>, we&apos;ve sent a link to
                reset the password.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block w-full rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark"
              >
                Back to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                  {error}
                </div>
              )}
              <div className="mb-6">
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center font-mono text-[11px] text-ink-soft">
          <Link href="/login" className="text-primary hover:text-primary-dark">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}

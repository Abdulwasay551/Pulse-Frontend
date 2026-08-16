"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/site/Logo";
import BackToHomeLink from "@/components/site/BackToHomeLink";
import { resetPassword, ApiError } from "@/lib/auth-api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!uid || !token) {
    return (
      <div className="rounded-2xl border border-line bg-card p-7 text-center shadow-lg shadow-ink/5">
        <p className="text-sm text-ink">This reset link is missing some information.</p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword({ uid: uid!, token: token!, new_password: password, new_password2: password2 });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-card p-7 text-center shadow-lg shadow-ink/5">
        <p className="text-sm text-ink">Password reset. Taking you to log in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-card p-7 shadow-lg shadow-ink/5">
      {error && (
        <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
          {error}
        </div>
      )}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
          New password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
        />
      </div>
      <div className="mb-6">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
          Confirm new password
        </label>
        <input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {loading ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <Logo className="h-14 w-14" />
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-ink">Choose a new password</h1>
            <p className="mt-1 text-sm text-ink-soft">Make it something you haven&apos;t used before</p>
          </div>
        </div>

        <Suspense
          fallback={<div className="rounded-2xl border border-line bg-card p-7 text-center text-sm text-ink-soft">Loading…</div>}
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

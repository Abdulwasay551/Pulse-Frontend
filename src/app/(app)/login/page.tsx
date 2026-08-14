"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/site/Logo";
import BackToHomeLink from "@/components/site/BackToHomeLink";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      router.push("/dashboard");
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
            <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-soft">Log in to your Pulse desk</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-card p-7 shadow-lg shadow-ink/5"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
              Username or email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@agency.com"
              autoComplete="username"
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="mb-2">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="mb-6 flex justify-end">
            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-dark">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-ink-soft">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/site/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function logIn(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    // Demo only — any credentials work, nothing is verified anywhere.
    setTimeout(() => {
      localStorage.setItem("evohr_demo_session", "true");
      router.push("/dashboard");
    }, 500);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-6">
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
            <p className="mt-1 text-sm text-ink-soft">Log in to your EvoHR desk</p>
          </div>
        </div>

        <form
          onSubmit={logIn}
          className="rounded-2xl border border-line bg-card p-7 shadow-lg shadow-ink/5"
        >
          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-5 py-3 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[11px] text-ink-soft">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={() => logIn()}
            className="w-full rounded-lg border border-line bg-cream px-5 py-3 font-mono text-sm font-semibold text-ink transition-colors hover:bg-cream-dim"
          >
            Continue as demo user →
          </button>
        </form>

        <p className="mt-5 text-center font-mono text-[11px] text-ink-soft">
          This is a sample walkthrough. Any email &amp; password works — nothing is stored.
        </p>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/site/Logo";
import BackToHomeLink from "@/components/site/BackToHomeLink";
import { useAuth } from "@/lib/auth-context";
import { ApiError, getInviteDetail, type InviteDetail } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const { register } = useAuth();

  const [invite, setInvite] = useState<InviteDetail | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(!!inviteToken);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) return;
    getInviteDetail(inviteToken)
      .then((detail) => {
        setInvite(detail);
        setEmail(detail.email);
      })
      .catch((err) => setInviteError(err instanceof ApiError ? err.message : "This invite link is invalid or already used."))
      .finally(() => setCheckingInvite(false));
  }, [inviteToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        username,
        email,
        password,
        password2,
        ...(inviteToken ? { invite_token: inviteToken } : { organization_name: organizationName }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo className="h-10 w-10" />
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-ink">
            {invite ? `Join ${invite.organization}` : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {invite ? `Set up your employee login for ${invite.employee_name}` : "Start running your desk on Pulse"}
          </p>
        </div>
      </div>

      {checkingInvite ? (
        <div className="rounded-2xl border border-line bg-card p-7 text-center text-sm text-ink-soft shadow-lg shadow-ink/5">
          Checking your invite…
        </div>
      ) : inviteError ? (
        <div className="rounded-2xl border border-line bg-card p-7 text-center shadow-lg shadow-ink/5">
          <p className="text-sm text-maroon">{inviteError}</p>
          <Link
            href="/signup"
            className="mt-4 inline-block text-xs font-semibold text-primary hover:text-primary-dark"
          >
            Sign up without an invite instead
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-card p-7 shadow-lg shadow-ink/5">
          {error && (
            <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
              {error}
            </div>
          )}

          {!invite && (
            <div className="mb-4">
              <label className={labelClass}>Company name</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Staffing"
                className={inputClass}
              />
            </div>
          )}
          <div className="mb-4">
            <label className={labelClass}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jordanblake"
              autoComplete="username"
              className={inputClass}
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              autoComplete="email"
              readOnly={!!invite}
              className={`${inputClass} ${invite ? "opacity-60" : ""}`}
            />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div className="mb-6">
            <label className={labelClass}>Confirm password</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-[11px] text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary-dark">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-6 py-12">
      <BackToHomeLink />
      <div
        aria-hidden="true"
        className="animate-drift-a pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-primary-light/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift-b pointer-events-none absolute -bottom-32 -left-20 h-[380px] w-[380px] rounded-full bg-primary/15 blur-3xl"
      />

      <Suspense
        fallback={<div className="rounded-2xl border border-line bg-card p-7 text-center text-sm text-ink-soft">Loading…</div>}
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}

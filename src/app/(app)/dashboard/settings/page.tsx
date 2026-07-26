"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError, updateMe, changePassword } from "@/lib/auth-api";

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-line"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-cream transition-transform ${on ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user, setUser, withAuth, logout } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const initials = (user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username : "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    setProfileLoading(true);
    try {
      const updated = await withAuth((token) =>
        updateMe(token, { first_name: firstName, last_name: lastName, email })
      );
      setUser(updated);
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordLoading(true);
    try {
      await withAuth((token) =>
        changePassword(token, {
          old_password: oldPassword,
          new_password: newPassword,
          new_password2: newPassword2,
        })
      );
      // Changing the password invalidates every session server-side
      // (including this one), so send the user back through login.
      await logout();
      router.push("/login");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setPasswordLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage your profile and notification preferences.</p>
      </div>

      <form onSubmit={handleProfileSave} className="rounded-2xl border border-line bg-card p-6">
        <h2 className="mb-5 font-display text-base font-bold text-ink">Profile</h2>
        <div className="mb-5 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {initials}
          </span>
          <div className="text-xs text-ink-soft">
            Username: <span className="text-ink">{user?.username}</span>
          </div>
        </div>

        {profileError && (
          <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
            {profileError}
          </div>
        )}
        {profileSaved && (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-sm text-primary">
            Profile updated.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
              First name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
              Last name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={profileLoading}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {profileLoading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordChange} className="mt-4 rounded-2xl border border-line bg-card p-6">
        <h2 className="mb-1 font-display text-base font-bold text-ink">Change password</h2>
        <p className="mb-5 text-sm text-ink-soft">You&apos;ll be logged out everywhere else after this.</p>

        {passwordError && (
          <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
            {passwordError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
              Current password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
              Confirm new password
            </label>
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {passwordLoading ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>

      <div className="mt-4 rounded-2xl border border-line bg-card p-6">
        <h2 className="mb-4 font-display text-base font-bold text-ink">Notifications</h2>
        <div className="flex flex-col divide-y divide-line">
          {[
            { label: "New candidate applications", defaultOn: true },
            { label: "Requisition status changes", defaultOn: true },
            { label: "Payroll run reminders", defaultOn: true },
            { label: "Weekly desk summary email", defaultOn: false },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-3.5">
              <span className="text-sm text-ink">{row.label}</span>
              <Toggle defaultOn={row.defaultOn} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

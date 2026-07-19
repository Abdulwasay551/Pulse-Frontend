"use client";

import { useState } from "react";
import { demoUser } from "@/lib/dashboard-data";

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
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage your profile and notification preferences.</p>
      </div>

      <div className="rounded-2xl border border-line bg-card p-6">
        <h2 className="mb-5 font-display text-base font-bold text-ink">Profile</h2>
        <div className="mb-5 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 font-mono text-lg font-bold text-primary">
            {demoUser.initials}
          </span>
          <button className="rounded-lg border border-line px-3.5 py-2 font-mono text-xs font-semibold text-ink hover:bg-cream-dim">
            Change photo
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
              Full name
            </label>
            <input
              defaultValue={demoUser.name}
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
              Role
            </label>
            <input
              defaultValue={demoUser.role}
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink-soft">
              Email
            </label>
            <input
              defaultValue={demoUser.email}
              className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

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

      <div className="mt-6 flex justify-end">
        <button className="rounded-lg bg-primary px-6 py-3 font-mono text-sm font-semibold text-cream transition-colors hover:bg-primary-dark">
          Save changes
        </button>
      </div>
    </div>
  );
}

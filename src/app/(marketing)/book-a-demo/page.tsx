"use client";

import { useState } from "react";
import PageHeader from "@/components/site/PageHeader";
import { submitDemoRequest, ApiError } from "@/lib/auth-api";

export default function BookADemoPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await submitDemoRequest({
        full_name: fullName,
        email,
        contact_number: contactNumber,
        business_name: businessName,
        message,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Book a demo"
        title="See EvoHR run your desk"
        subtitle="Tell us a bit about your agency and we'll get back to you to set up a walkthrough."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-card p-7 shadow-lg shadow-ink/5 sm:p-9">
          {sent ? (
            <div className="py-6 text-center">
              <h2 className="font-display text-xl font-bold text-ink">Thanks — we&apos;ll be in touch shortly.</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Someone from our team will reach out to schedule your walkthrough.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
                  Full name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jordan Blake"
                  required
                  className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
                  Email ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  required
                  className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
                  Contact number
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+1 555 123 4567"
                  required
                  className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
                  Business name
                </label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Staffing"
                  required
                  className="w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What are you hoping to solve with EvoHR?"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {loading ? "Sending…" : "Book a Demo"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

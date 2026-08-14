import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy — Pulse",
  description: "How Pulse collects, uses, and protects your data.",
};

const sections = [
  {
    heading: "Information we collect",
    body: "When you use Pulse, we collect account information (name, email, agency name), data you enter into the platform (candidate, client, and requisition records), and standard usage data (device, browser, log data) needed to operate and secure the service.",
  },
  {
    heading: "How we use information",
    body: "We use collected information to provide and improve the platform, authenticate users, send service-related communications, and maintain the security and integrity of the system. We do not sell your data to third parties.",
  },
  {
    heading: "Data security",
    body: "We use industry-standard safeguards, including encryption in transit and access controls, to protect data stored in Pulse. No method of transmission or storage is 100% secure, and we continuously work to improve our safeguards.",
  },
  {
    heading: "Cookies",
    body: "Pulse uses essential cookies to keep you signed in and remember preferences such as sidebar state. We do not use third-party advertising cookies.",
  },
  {
    heading: "Third-party services",
    body: "We may rely on trusted third-party infrastructure providers (such as hosting and database providers) to operate Pulse. These providers are contractually bound to protect your data and only process it on our behalf.",
  },
  {
    heading: "Your rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us. Agency administrators can export or delete their organization's data directly from account settings.",
  },
  {
    heading: "Changes to this policy",
    body: "We may update this policy from time to time. Material changes will be communicated via email or an in-product notice before they take effect.",
  },
  {
    heading: "Contact us",
    body: "Questions about this policy can be sent to privacy@Pulse.demo.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Last updated July 2026. This page describes how Pulse handles data on this demo/staging site."
      />
      <section className="px-6 pb-24">
        <div className="mx-auto flex max-w-2xl flex-col gap-10">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display text-lg font-bold text-ink">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

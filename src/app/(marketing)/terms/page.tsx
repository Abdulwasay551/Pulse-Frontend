import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";

export const metadata: Metadata = {
  title: "Terms of Service — Pulse",
  description: "The terms that govern use of the Pulse platform.",
};

const sections = [
  {
    heading: "Acceptance of terms",
    body: "By creating an account or using Pulse, you agree to these terms. If you're using Pulse on behalf of an organization, you're agreeing on its behalf and confirming you have the authority to do so.",
  },
  {
    heading: "Use of the service",
    body: "Pulse is provided for managing recruiting, payroll, and workforce data for your organization. You agree not to misuse the service, attempt to disrupt it, or use it to store unlawful content.",
  },
  {
    heading: "Account responsibilities",
    body: "You're responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us promptly of any unauthorized use.",
  },
  {
    heading: "Subscription and payment",
    body: "Paid plans are billed per recruiter seat, monthly or annually as selected at checkout. Fees are non-refundable except where required by law. Prices may change with advance notice.",
  },
  {
    heading: "Intellectual property",
    body: "Pulse and its original content, features, and functionality remain the property of Pulse and its licensors. Data you upload remains yours; we only process it to provide the service.",
  },
  {
    heading: "Termination",
    body: "You may cancel your subscription at any time from account settings. We may suspend or terminate accounts that violate these terms or pose a security risk to the platform.",
  },
  {
    heading: "Limitation of liability",
    body: "Pulse is provided \"as is\" without warranties of any kind. To the extent permitted by law, Pulse is not liable for indirect, incidental, or consequential damages arising from use of the service.",
  },
  {
    heading: "Changes to these terms",
    body: "We may revise these terms from time to time. Continued use of Pulse after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    heading: "Contact us",
    body: "Questions about these terms can be sent to legal@Pulse.demo.",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Last updated July 2026. This page describes the terms for using Pulse on this demo/staging site."
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

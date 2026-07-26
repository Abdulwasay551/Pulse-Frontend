import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface PortalCandidate {
  name: string;
  initials: string;
  role: string;
  client_name: string | null;
  requisition_title: string | null;
  stage: "Sourced" | "Interview" | "Offer" | "Placed" | "Rejected";
  applied_at: string;
}

const STAGE_STEPS: PortalCandidate["stage"][] = ["Sourced", "Interview", "Offer", "Placed"];

async function getPortalCandidate(token: string): Promise<PortalCandidate | null> {
  const res = await fetch(`${API_BASE}/recruit/portal/${token}/`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

// Every visit reflects live status, and the token is only meaningful at
// request time — never prerender or cache this page.
export const dynamic = "force-dynamic";

export default async function CandidatePortalStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const candidate = await getPortalCandidate(token);
  if (!candidate) notFound();

  const rejected = candidate.stage === "Rejected";
  const currentIndex = STAGE_STEPS.indexOf(candidate.stage);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-2xl border border-line bg-card p-8 text-center shadow-lg shadow-ink/5">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
          {candidate.initials}
        </span>
        <h1 className="font-display text-2xl font-bold text-ink">{candidate.name}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {candidate.requisition_title ?? candidate.role}
          {candidate.client_name ? ` · ${candidate.client_name}` : ""}
        </p>

        {rejected ? (
          <div className="mt-8 rounded-xl border border-line bg-cream px-5 py-4 text-sm text-ink-soft">
            This application isn&apos;t moving forward at this time. Thank you for your interest — we&apos;ll keep
            your details on file for future roles.
          </div>
        ) : (
          <div className="mt-10 flex items-center justify-between">
            {STAGE_STEPS.map((step, i) => {
              const done = i <= currentIndex;
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    <div className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-primary" : "bg-line"}`} />
                    {done ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 shrink-0 text-line" />
                    )}
                    <div
                      className={`h-0.5 flex-1 ${i === STAGE_STEPS.length - 1 ? "opacity-0" : i < currentIndex ? "bg-primary" : "bg-line"}`}
                    />
                  </div>
                  <span className={`mt-2 text-xs font-semibold ${done ? "text-ink" : "text-ink-soft"}`}>{step}</span>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-xs text-ink-soft">Applied {candidate.applied_at}</p>
      </div>
    </div>
  );
}

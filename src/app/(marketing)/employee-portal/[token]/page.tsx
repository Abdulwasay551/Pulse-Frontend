import { notFound } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface PortalEmployee {
  name: string;
  initials: string;
  job_title: string;
  department: string;
  manager_name: string | null;
  hire_date: string;
  status: "Active" | "On Leave" | "Terminated";
}

async function getPortalEmployee(token: string): Promise<PortalEmployee | null> {
  const res = await fetch(`${API_BASE}/people/portal/${token}/`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

const statusTone: Record<PortalEmployee["status"], string> = {
  Active: "bg-primary/15 text-primary",
  "On Leave": "bg-amber-soft text-amber",
  Terminated: "bg-maroon-soft text-maroon",
};

// Reflects live status at request time — never prerender or cache this page.
export const dynamic = "force-dynamic";

export default async function EmployeePortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const employee = await getPortalEmployee(token);
  if (!employee) notFound();

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-2xl border border-line bg-card p-8 text-center shadow-lg shadow-ink/5">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
          {employee.initials}
        </span>
        <h1 className="font-display text-2xl font-bold text-ink">{employee.name}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {employee.job_title || "—"}
          {employee.department ? ` · ${employee.department}` : ""}
        </p>

        <span
          className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusTone[employee.status]}`}
        >
          {employee.status}
        </span>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 text-left">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-soft">Manager</div>
            <div className="mt-1 text-sm text-ink">{employee.manager_name ?? "—"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-soft">Hire date</div>
            <div className="mt-1 text-sm text-ink">{employee.hire_date}</div>
          </div>
        </div>

        <p className="mt-8 text-xs text-ink-soft">
          Questions about your profile, payslips, or benefits? Reach out to your People team directly.
        </p>
      </div>
    </div>
  );
}

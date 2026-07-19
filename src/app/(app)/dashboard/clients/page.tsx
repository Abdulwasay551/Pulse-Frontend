import { Building2 } from "lucide-react";
import { clients, type ClientStatus } from "@/lib/dashboard-data";

const statusTone: Record<ClientStatus, string> = {
  Active: "bg-primary/15 text-primary",
  Prospect: "bg-amber-soft text-amber",
  "At risk": "bg-maroon-soft text-maroon",
};

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Clients</h1>
        <p className="mt-1 text-sm text-ink-soft">Every company your desk places candidates with.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <div key={c.id} className="rounded-2xl border border-line bg-card p-5">
            <div className="mb-3 flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold whitespace-nowrap ${statusTone[c.status]}`}
              >
                {c.status}
              </span>
            </div>
            <h3 className="font-display text-base font-bold text-ink">{c.name}</h3>
            <p className="text-xs text-ink-soft">{c.industry}</p>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <span className="text-ink-soft">Open roles</span>
              <span className="font-mono font-semibold text-ink">{c.openRoles}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-ink-soft">Contact</span>
              <span className="text-ink">{c.contact}</span>
            </div>
            <a
              href={`mailto:${c.contactEmail}`}
              className="mt-3 block font-mono text-[11px] text-primary hover:text-primary-dark"
            >
              {c.contactEmail}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

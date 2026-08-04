"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  ClipboardCheck,
  Clock,
  IdCard,
  Laptop,
  LifeBuoy,
  LogIn,
  LogOut,
  Megaphone,
  Receipt,
  Send,
  Settings,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  attendanceRecordsApi,
  employeesApi,
  shiftsApi,
  type AttendanceRecord,
  type Employee,
  type Shift,
} from "@/lib/people-api";
import { getDashboardSummary, type ActivityItem } from "@/lib/recruit-api";
import { announcementsApi, type Announcement } from "@/lib/announcements-api";
import {
  clockIn,
  clockOut,
  getMyDashboard,
  getMyOnboardingChecklist,
  getMyTalent,
  listMyBenefitClaims,
  listMySupportTickets,
  submitMyBenefitClaim,
  submitMySupportTicket,
  type MyDashboard,
  type MyOnboardingChecklist,
  type MyTalent,
} from "@/lib/role-api";
import type { BenefitClaim } from "@/lib/payroll-benefits-api";
import type { SupportTicket } from "@/lib/it-assets-api";
import { ApiError, type UserRole } from "@/lib/auth-api";
import { NARROW_ROLES, visibleModuleKeysFor } from "@/lib/role-access";

// Same five-color rotation the marketing solutions cards use (see
// ProductCards.tsx CARD_VARIANTS) — proven to read as distinct, energetic,
// and on-brand, and reused here so each module feels like its own product
// the moment you land on it, not a plain uniform tile.
const moduleVariants = [
  { card: "bg-primary-dark", badge: "bg-primary-light", icon: "text-cream", title: "text-cream", desc: "text-cream/60", cta: "text-primary-light" },
  { card: "bg-card border border-line", badge: "bg-primary", icon: "text-cream", title: "text-ink", desc: "text-ink-soft", cta: "text-primary" },
  { card: "bg-cream-dim border border-line", badge: "bg-primary-light", icon: "text-cream", title: "text-ink", desc: "text-ink-soft", cta: "text-primary" },
  { card: "bg-primary-light", badge: "bg-cream", icon: "text-primary-dark", title: "text-cream", desc: "text-cream/80", cta: "text-cream" },
  { card: "bg-primary-dark", badge: "bg-cream", icon: "text-primary-dark", title: "text-cream", desc: "text-cream/60", cta: "text-primary-light" },
];

const modules = [
  {
    key: "recruit",
    href: "/dashboard/recruit",
    icon: Users,
    title: "EVO-Recruit",
    description:
      "Applicant tracking, offer letters, job requisitions, onboarding, offboarding, and rehire — your full hiring lifecycle.",
  },
  {
    key: "people",
    href: "/dashboard/people",
    icon: IdCard,
    title: "EVO-People Management",
    description: "Employee records, org chart, self-service, engagement, and attendance — HR core.",
  },
  {
    key: "talent",
    href: "/dashboard/talent",
    icon: TrendingUp,
    title: "EVO-Talent Management",
    description: "Goals & appraisals, learning paths, competency mapping, and succession planning.",
  },
  {
    key: "payroll-benefits",
    href: "/dashboard/payroll-benefits",
    icon: Banknote,
    title: "EVO-Payroll & Benefits",
    description: "Payroll processing, multi-country compliance, benefits enrollment, and claims.",
  },
  {
    key: "it-assets",
    href: "/dashboard/it-assets",
    icon: Laptop,
    title: "EVO-IT & Asset Management",
    description: "Device provisioning, asset inventory, warranty tracking, and IT support tickets.",
  },
];

const toneDot: Record<string, string> = {
  primary: "bg-primary",
  amber: "bg-amber",
  maroon: "bg-maroon",
  neutral: "bg-ink-soft",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(t: string | null | undefined) {
  if (!t) return "—";
  const [hStr, mStr] = t.split(":");
  let h = Number(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

function formatMoney(v: string | null | undefined) {
  if (v === null || v === undefined || v === "") return "Not set";
  const n = Number(v);
  if (Number.isNaN(n)) return "Not set";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function relativeTime(iso: string) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function scheduleForEmployee(shifts: Shift[], employeeId: number) {
  const byDay = new Map<number, Shift>();
  shifts
    .filter((s) => s.employee === employeeId)
    .forEach((s) => {
      const day = new Date(`${s.date}T00:00:00`).getDay();
      const existing = byDay.get(day);
      if (!existing || s.date > existing.date) byDay.set(day, s);
    });
  return Array.from(byDay.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([day, s]) => ({ day: WEEKDAYS[day], start: s.start_time, end: s.end_time }));
}

function ModuleCardsGrid({ items }: { items: typeof modules }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => {
        const variant = moduleVariants[modules.indexOf(m) % moduleVariants.length];
        return (
          <Link
            key={m.href}
            href={m.href}
            className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 shadow-md shadow-ink/5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10 ${variant.card}`}
          >
            <span
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 ${variant.badge}`}
            >
              <m.icon className={`h-6 w-6 ${variant.icon}`} />
            </span>
            <h2 className={`font-display text-lg font-bold ${variant.title}`}>{m.title}</h2>
            <p className={`mt-2 text-sm leading-relaxed ${variant.desc}`}>{m.description}</p>
            <span className={`mt-auto flex w-fit items-center gap-1.5 pt-5 text-xs font-semibold ${variant.cta}`}>
              Open module
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function Hero({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="relative overflow-hidden px-6 py-16 text-center sm:py-20"
      style={{
        backgroundImage: [
          "radial-gradient(circle at 15% 20%, rgba(77,111,224,0.35), transparent 45%)",
          "radial-gradient(circle at 85% 80%, rgba(185,134,31,0.18), transparent 45%)",
          "radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px)",
        ].join(", "),
        backgroundSize: "auto, auto, 22px 22px",
        backgroundColor: "var(--primary-dark)",
      }}
    >
      <span className="mb-3 inline-block text-xs font-semibold tracking-wide text-primary-light uppercase">
        The EvoHR Suite
      </span>
      <h1 className="font-display text-3xl font-bold text-cream md:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-lg text-cream/70 md:text-lg">{description}</p>
    </div>
  );
}

interface FeedItem {
  id: string;
  message: string;
  time: string;
  tone: ActivityItem["tone"];
  isAnnouncement?: boolean;
}

function RecentActivityCard({
  items,
  loading,
  onPost,
  posting,
}: {
  items: FeedItem[];
  loading: boolean;
  onPost?: (message: string) => void;
  posting?: boolean;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-ink">Recent activity</h2>

      {onPost && (
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!draft.trim()) return;
            onPost(draft.trim());
            setDraft("");
          }}
          className="mb-4 flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            placeholder="Post an announcement…"
            className="flex-1 rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={posting || !draft.trim()}
            aria-label="Post announcement"
            className="flex shrink-0 items-center justify-center rounded-lg bg-primary p-2.5 text-cream transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing yet — activity shows up here as work happens.</p>
      ) : (
        <div className="flex flex-col">
          {items.map((a) => (
            <div key={a.id} className="flex items-start gap-2.5 border-b border-line py-3 last:border-0">
              {a.isAnnouncement ? (
                <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              ) : (
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${toneDot[a.tone]}`} />
              )}
              <p className="flex-1 text-sm text-ink">{a.message}</p>
              <span className="shrink-0 text-xs text-ink-soft">{a.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type EmployeesTab = "details" | "schedule" | "pay";

function EmployeesWidget({ employees, shifts, loading }: { employees: Employee[]; shifts: Shift[]; loading: boolean }) {
  const [tab, setTab] = useState<EmployeesTab>("details");
  const tabs: { key: EmployeesTab; label: string; icon: typeof IdCard }[] = [
    { key: "details", label: "Employees", icon: IdCard },
    { key: "schedule", label: "Schedule", icon: CalendarDays },
    { key: "pay", label: "Monthly pay", icon: Banknote },
  ];

  return (
    <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-cream-dim p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                tab === t.key ? "bg-card text-primary shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <Link href="/dashboard/employee-database" className="text-xs font-semibold text-primary hover:text-primary-dark">
          View all →
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : employees.length === 0 ? (
        <p className="text-sm text-ink-soft">No employees yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {employees.slice(0, 6).map((e) => {
            const schedule = tab === "schedule" ? scheduleForEmployee(shifts, e.id) : [];
            return (
              <div key={e.id} className="rounded-xl border border-line bg-cream px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{e.name}</div>
                    <div className="truncate text-xs text-ink-soft">
                      {e.job_title || "—"}
                      {e.department ? ` · ${e.department}` : ""}
                    </div>
                  </div>
                  {tab === "details" && (
                    <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-primary">
                      {e.department || "No department"}
                    </span>
                  )}
                  {tab === "pay" && (
                    <span className="shrink-0 text-sm font-semibold text-ink">{formatMoney(e.monthly_salary)}</span>
                  )}
                </div>
                {tab === "schedule" && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {schedule.length === 0 ? (
                      <span className="text-xs text-ink-soft">No shifts scheduled</span>
                    ) : (
                      schedule.map((s) => (
                        <span
                          key={s.day}
                          className="rounded-full bg-primary/10 px-2 py-1 text-[10.5px] font-medium whitespace-nowrap text-primary"
                        >
                          {s.day} {formatTime(s.start)}–{formatTime(s.end)} ET
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TimeSheetCard({ records, loading }: { records: AttendanceRecord[]; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <Clock className="h-5 w-5 text-primary" /> Time sheet
        </h2>
        <Link href="/dashboard/attendance" className="text-xs font-semibold text-primary hover:text-primary-dark">
          View all →
        </Link>
      </div>
      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-ink-soft">No clock-ins recorded today.</p>
      ) : (
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3.5 py-2.5">
              <span className="truncate text-sm font-medium text-ink">{r.employee_detail.name}</span>
              <span className="flex shrink-0 items-center gap-1 text-xs text-ink-soft">
                <LogIn className="h-3 w-3" /> {formatTime(r.clock_in)}
                <span className="mx-1">·</span>
                <LogOut className="h-3 w-3" /> {formatTime(r.clock_out)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HrHome({ firstName }: { firstName: string }) {
  const { withAuth } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [todaysAttendance, setTodaysAttendance] = useState<AttendanceRecord[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  async function load() {
    try {
      const [emps, allShifts, attendance, summary, announcements] = await withAuth((token) =>
        Promise.all([
          employeesApi.list(token),
          shiftsApi.list(token),
          attendanceRecordsApi.list(token),
          getDashboardSummary(token),
          announcementsApi.list(token),
        ])
      );
      setEmployees(emps);
      setShifts(allShifts);
      const today = new Date().toISOString().slice(0, 10);
      setTodaysAttendance(attendance.filter((a) => a.date === today && a.clock_in));

      const announcementItems: FeedItem[] = announcements.map((a: Announcement) => ({
        id: `announcement-${a.id}`,
        message: a.message,
        time: relativeTime(a.created_at),
        tone: "primary",
        isAnnouncement: true,
      }));
      setFeed([...announcementItems, ...summary.recent_activity]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePostAnnouncement(message: string) {
    setPosting(true);
    try {
      await withAuth((token) => announcementsApi.create(token, { message }));
      await load();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="-m-4 bg-white sm:-m-6">
      <Hero title={`Hi, ${firstName}`} description="Pick a module to get to work — every part of your business, in one place." />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">All modules</h2>
        <ModuleCardsGrid items={modules} />

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <EmployeesWidget employees={employees} shifts={shifts} loading={loading} />

          <div className="flex flex-col gap-4">
            <TimeSheetCard records={todaysAttendance} loading={loading} />
            <RecentActivityCard items={feed} loading={loading} onPost={handlePostAnnouncement} posting={posting} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NarrowRoleHome({ firstName, role }: { firstName: string; role: UserRole }) {
  const visibleKeys = visibleModuleKeysFor(role);
  const visibleModules = modules.filter((m) => !visibleKeys || visibleKeys.includes(m.key));

  return (
    <div className="-m-4 bg-white sm:-m-6">
      <Hero title={`Hi, ${firstName}`} description="Pick up where you left off." />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {role === "Department Head" && (
          <div className="mb-6 rounded-2xl border border-line bg-card p-5 text-sm text-ink-soft">
            Your most central daily tool is the{" "}
            <Link href="/dashboard/employee-database" className="font-semibold text-primary hover:text-primary-dark">
              Employee Database
            </Link>
            , scoped to your own department.
          </div>
        )}
        <ModuleCardsGrid items={visibleModules} />
      </div>
    </div>
  );
}

const taskStatusTone: Record<string, string> = {
  Pending: "bg-ink-soft/15 text-ink-soft",
  "In Progress": "bg-amber-soft text-amber",
  Done: "bg-primary/15 text-primary",
  Open: "bg-amber-soft text-amber",
  Resolved: "bg-primary/15 text-primary",
  Closed: "bg-ink-soft/15 text-ink-soft",
  Submitted: "bg-ink-soft/15 text-ink-soft",
  "Under Review": "bg-amber-soft text-amber",
  Approved: "bg-primary/15 text-primary",
  Rejected: "bg-maroon-soft text-maroon",
  Paid: "bg-primary/15 text-primary",
};

function OnboardingChecklistCard({ checklist, loading }: { checklist: MyOnboardingChecklist | null; loading: boolean }) {
  if (!loading && (!checklist || !checklist.onboarding)) return null;

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <ClipboardCheck className="h-5 w-5 text-primary" /> My onboarding checklist
      </h2>
      {loading || !checklist?.onboarding ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : (
        <>
          <div className="mb-3 text-xs text-ink-soft">Status: {checklist.onboarding.status}</div>
          <div className="flex flex-col gap-2">
            {checklist.tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3.5 py-2.5">
                <span className="truncate text-sm text-ink">{t.title}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${taskStatusTone[t.status] ?? "bg-ink-soft/15 text-ink-soft"}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MyPerformanceCard({ talent, loading }: { talent: MyTalent | null; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Star className="h-5 w-5 text-primary" /> My performance
      </h2>
      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : !talent || (talent.appraisals.length === 0 && talent.competency_ratings.length === 0) ? (
        <p className="text-sm text-ink-soft">Nothing on file yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {talent.appraisals.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Appraisals</div>
              <div className="flex flex-col gap-2">
                {talent.appraisals.slice(0, 3).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-ink">{a.period}</span>
                    <span className="shrink-0 text-ink-soft">{a.overall_rating}/5 · {a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {talent.competency_ratings.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Competencies</div>
              <div className="flex flex-wrap gap-1.5">
                {talent.competency_ratings.slice(0, 8).map((c) => (
                  <span key={c.id} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    {c.competency} · {c.level}/5
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BenefitClaimsCard({
  claims,
  loading,
  onSubmit,
  submitting,
}: {
  claims: BenefitClaim[];
  loading: boolean;
  onSubmit: (data: { claim_type: string; amount: string; description: string }) => void;
  submitting: boolean;
}) {
  const [claimType, setClaimType] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Receipt className="h-5 w-5 text-primary" /> Benefit claims
      </h2>
      {loading ? (
        <p className="mb-4 text-sm text-ink-soft">Loading…</p>
      ) : claims.length === 0 ? (
        <p className="mb-4 text-sm text-ink-soft">No claims submitted yet.</p>
      ) : (
        <div className="mb-4 flex flex-col gap-2">
          {claims.slice(0, 5).map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3.5 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-ink">{c.claim_type}</div>
                <div className="text-xs text-ink-soft">${c.amount}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${taskStatusTone[c.status] ?? "bg-ink-soft/15 text-ink-soft"}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!claimType.trim() || !amount) return;
          onSubmit({ claim_type: claimType.trim(), amount, description });
          setClaimType("");
          setAmount("");
          setDescription("");
        }}
        className="flex flex-col gap-2 border-t border-line pt-4"
      >
        <div className="grid grid-cols-2 gap-2">
          <input
            value={claimType}
            onChange={(ev) => setClaimType(ev.target.value)}
            placeholder="Claim type"
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(ev) => setAmount(ev.target.value)}
            placeholder="Amount"
            className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <input
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          placeholder="Description (optional)"
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !claimType.trim() || !amount}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit claim"}
        </button>
      </form>
    </div>
  );
}

function SupportTicketsCard({
  tickets,
  loading,
  onSubmit,
  submitting,
}: {
  tickets: SupportTicket[];
  loading: boolean;
  onSubmit: (data: { subject: string; description: string }) => void;
  submitting: boolean;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
        <LifeBuoy className="h-5 w-5 text-primary" /> Support tickets
      </h2>
      {loading ? (
        <p className="mb-4 text-sm text-ink-soft">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="mb-4 text-sm text-ink-soft">No tickets submitted yet.</p>
      ) : (
        <div className="mb-4 flex flex-col gap-2">
          {tickets.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3.5 py-2.5">
              <span className="truncate text-sm font-medium text-ink">{t.subject}</span>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${taskStatusTone[t.status] ?? "bg-ink-soft/15 text-ink-soft"}`}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!subject.trim()) return;
          onSubmit({ subject: subject.trim(), description });
          setSubject("");
          setDescription("");
        }}
        className="flex flex-col gap-2 border-t border-line pt-4"
      >
        <input
          value={subject}
          onChange={(ev) => setSubject(ev.target.value)}
          placeholder="Subject"
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
        />
        <input
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          placeholder="Description (optional)"
          className="rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !subject.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit ticket"}
        </button>
      </form>
    </div>
  );
}

function EmployeeHome({ firstName }: { firstName: string }) {
  const { withAuth } = useAuth();
  const [data, setData] = useState<MyDashboard | null>(null);
  const [checklist, setChecklist] = useState<MyOnboardingChecklist | null>(null);
  const [talent, setTalent] = useState<MyTalent | null>(null);
  const [claims, setClaims] = useState<BenefitClaim[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [dashboard, onboarding, myTalent, myClaims, myTickets] = await withAuth((token) =>
        Promise.all([
          getMyDashboard(token),
          getMyOnboardingChecklist(token),
          getMyTalent(token),
          listMyBenefitClaims(token),
          listMySupportTickets(token),
        ])
      );
      setData(dashboard);
      setChecklist(onboarding);
      setTalent(myTalent);
      setClaims(myClaims);
      setTickets(myTickets);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmitClaim(claim: { claim_type: string; amount: string; description: string }) {
    setSubmittingClaim(true);
    try {
      await withAuth((token) => submitMyBenefitClaim(token, claim));
      const myClaims = await withAuth((token) => listMyBenefitClaims(token));
      setClaims(myClaims);
    } finally {
      setSubmittingClaim(false);
    }
  }

  async function handleSubmitTicket(ticket: { subject: string; description: string }) {
    setSubmittingTicket(true);
    try {
      await withAuth((token) => submitMySupportTicket(token, ticket));
      const myTickets = await withAuth((token) => listMySupportTickets(token));
      setTickets(myTickets);
    } finally {
      setSubmittingTicket(false);
    }
  }

  async function handleClockIn() {
    setClocking(true);
    setError(null);
    try {
      await withAuth((token) => clockIn(token));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't clock in. Please try again.");
    } finally {
      setClocking(false);
    }
  }

  async function handleClockOut() {
    setClocking(true);
    setError(null);
    try {
      await withAuth((token) => clockOut(token));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't clock out. Please try again.");
    } finally {
      setClocking(false);
    }
  }

  const attendance = data?.attendance_today ?? null;

  return (
    <div className="-m-4 sm:-m-6">
      <Hero title={`Welcome back, ${firstName}`} description="Here's what's on your plate today." />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Clock className="h-5 w-5 text-primary" /> Clock in / Clock out
            </h2>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</div>
            )}
            {loading ? (
              <p className="text-sm text-ink-soft">Loading…</p>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-ink-soft">Clock in</div>
                    <div className="mt-1 text-2xl font-bold text-ink">{attendance?.clock_in ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-ink-soft">Clock out</div>
                    <div className="mt-1 text-2xl font-bold text-ink">{attendance?.clock_out ?? "—"}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClockIn}
                    disabled={clocking || !!attendance?.clock_in}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-50"
                  >
                    <LogIn className="h-4 w-4" /> Clock in
                  </button>
                  <button
                    onClick={handleClockOut}
                    disabled={clocking || !attendance?.clock_in || !!attendance?.clock_out}
                    className="flex items-center gap-2 rounded-lg border border-line bg-cream px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-cream-dim disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" /> Clock out
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-line bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-ink">Goals & KPIs</h2>
              {loading ? (
                <p className="text-sm text-ink-soft">Loading…</p>
              ) : !data || data.goals.length === 0 ? (
                <p className="text-sm text-ink-soft">No goals set yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.goals.slice(0, 4).map((g) => (
                    <div key={g.id}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="truncate text-ink">{g.title}</span>
                        <span className="shrink-0 text-ink-soft">{g.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${g.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <RecentActivityCard items={data?.recent_activity ?? []} loading={loading} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <OnboardingChecklistCard checklist={checklist} loading={loading} />
          <MyPerformanceCard talent={talent} loading={loading} />
          <BenefitClaimsCard claims={claims} loading={loading} onSubmit={handleSubmitClaim} submitting={submittingClaim} />
          <SupportTicketsCard tickets={tickets} loading={loading} onSubmit={handleSubmitTicket} submitting={submittingTicket} />
        </div>

        <h2 className="mt-10 mb-4 font-display text-lg font-bold text-ink">Your access</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/settings"
            className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-sm font-bold text-ink">My Profile & Settings</h3>
              <p className="text-xs text-ink-soft">Update your name, email, and password.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHubPage() {
  const { user } = useAuth();
  const firstName = (user ? [user.first_name].filter(Boolean).join(" ") || user.username : "") || "there";

  if (user?.role === "Employee") return <EmployeeHome firstName={firstName} />;
  if (user?.role && NARROW_ROLES.includes(user.role)) return <NarrowRoleHome firstName={firstName} role={user.role} />;
  return <HrHome firstName={firstName} />;
}

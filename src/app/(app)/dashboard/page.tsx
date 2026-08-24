"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Clock,
  IdCard,
  Laptop,
  LogIn,
  LogOut,
  Megaphone,
  Send,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import {
  attendanceRecordsApi,
  employeesApi,
  getPeopleDashboardSummary,
  shiftsApi,
  type AttendanceRecord,
  type Employee,
  type PeopleDashboardSummary,
  type Shift,
} from "@/lib/people-api";
import { getDashboardSummary, type ActivityItem, type DashboardSummary } from "@/lib/recruit-api";
import { getTalentDashboardSummary, type TalentDashboardSummary } from "@/lib/talent-api";
import { getPayrollBenefitsDashboardSummary, type PayrollBenefitsDashboardSummary } from "@/lib/payroll-benefits-api";
import { getItAssetsDashboardSummary, type ItAssetsDashboardSummary } from "@/lib/it-assets-api";
import PlacementsChart from "@/components/dashboard/PlacementsChart";
import { PipelineWidget } from "@/components/site/widgets";
import { announcementsApi, type Announcement } from "@/lib/announcements-api";
import {
  clockIn,
  clockOut,
  getMyDashboard,
  getOrgHealth,
  type HealthScore,
  type MyDashboard,
  type PendingTask,
} from "@/lib/role-api";
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
    title: "Recruit",
    description:
      "Applicant tracking, offer letters, job requisitions, onboarding, offboarding, and rehire — your full hiring lifecycle.",
  },
  {
    key: "people",
    href: "/dashboard/people",
    icon: IdCard,
    title: "People Management",
    description: "Employee records, org chart, self-service, engagement, and attendance — HR core.",
  },
  {
    key: "talent",
    href: "/dashboard/talent",
    icon: TrendingUp,
    title: "Talent Management",
    description: "Goals & appraisals, learning paths, competency mapping, and succession planning.",
  },
  {
    key: "payroll-benefits",
    href: "/dashboard/payroll-benefits",
    icon: Banknote,
    title: "Payroll & Benefits",
    description: "Payroll processing, multi-country compliance, benefits enrollment, and claims.",
  },
  {
    key: "it-assets",
    href: "/dashboard/it-assets",
    icon: Laptop,
    title: "IT & Asset Management",
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

function healthStatusLabel(score: number) {
  if (score >= 85) return "Good";
  if (score >= 65) return "Fair";
  return "Needs attention";
}

/** A circular score gauge — used for both "ORG HEALTH" (HR home) and "MY
 * WORK HEALTH" (employee home), fed by the same backend shape
 * (core.health.compute_health) either way. */
function HealthGauge({ title, health, loading }: { title: string; health: HealthScore | null; loading: boolean }) {
  const score = health?.score ?? 100;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - score / 100);
  const tone = score >= 85 ? "var(--primary)" : score >= 65 ? "var(--amber)" : "var(--maroon)";

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">{title}</h2>
      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : (
        <>
          <div className="flex items-center gap-5">
            <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0 -rotate-90">
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--cream-dim)" strokeWidth="8" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke={tone}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
              <text
                x="48"
                y="48"
                textAnchor="middle"
                dominantBaseline="central"
                className="rotate-90"
                style={{ transformOrigin: "48px 48px", fontSize: "22px", fontWeight: 700, fill: "var(--ink)" }}
              >
                {score}
              </text>
            </svg>
            <div>
              <div className="text-sm font-semibold text-ink">{healthStatusLabel(score)}</div>
              <div className="text-xs text-ink-soft">
                {health && health.flags.length > 0
                  ? `${health.flags.length} flag${health.flags.length === 1 ? "" : "s"} need review`
                  : "No flags — all clear"}
              </div>
            </div>
          </div>
          {health && health.flags.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
              {health.flags.slice(0, 5).map((f) => (
                <div key={f.key} className="flex items-center justify-between text-xs">
                  <span className="text-ink-soft">{f.label}</span>
                  <span className="font-semibold text-ink">{f.count}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PendingTasksCard({ tasks, loading }: { tasks: PendingTask[]; loading: boolean }) {
  const toneClass: Record<PendingTask["tone"], string> = {
    primary: "bg-primary/15 text-primary",
    amber: "bg-amber-soft text-amber",
    maroon: "bg-maroon-soft text-maroon",
    neutral: "bg-cream-dim text-ink-soft",
  };
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-ink">My pending tasks</h2>
      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing pending — you&apos;re all caught up.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3.5 py-2.5 transition-colors hover:border-primary/40"
            >
              <span className="truncate text-sm text-ink">{t.label}</span>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${toneClass[t.tone]}`}>
                {t.status}
              </span>
            </Link>
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
  const { withAuth, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [todaysAttendance, setTodaysAttendance] = useState<AttendanceRecord[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  async function load() {
    try {
      const [emps, allShifts, attendance, summary, announcements, orgHealth] = await withAuth((token) =>
        Promise.all([
          employeesApi.list(token),
          shiftsApi.list(token),
          attendanceRecordsApi.list(token),
          getDashboardSummary(token),
          announcementsApi.list(token),
          getOrgHealth(token),
        ])
      );
      setEmployees(emps);
      setShifts(allShifts);
      setHealth(orgHealth);
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
      <WelcomeBanner
        name={firstName}
        role={user?.role}
        description="Pick a module to get to work — every part of your business, in one place."
        notificationCount={health?.flags.length}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <HealthGauge title="Org health" health={health} loading={loading} />
          <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
            <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Admin</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/dashboard/employee-database"
                className="group flex items-center gap-3 rounded-xl border border-line bg-cream px-4 py-3.5 transition-colors hover:border-primary/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink">Add or manage users</div>
                  <div className="truncate text-xs text-ink-soft">Provision accounts, assign roles</div>
                </div>
              </Link>
              <Link
                href="/dashboard/settings"
                className="group flex items-center gap-3 rounded-xl border border-line bg-cream px-4 py-3.5 transition-colors hover:border-primary/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink">Settings</div>
                  <div className="truncate text-xs text-ink-soft">Organization &amp; integrations</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

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

type OverviewStat = { label: string; value: string; change: string; href: string };

function StatRow({ stats, loading }: { stats: OverviewStat[]; loading: boolean }) {
  const items = loading ? Array.from({ length: 4 }) : stats;
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s, i) => {
        const stat = s as OverviewStat | undefined;
        return (
          <Link
            key={stat?.label ?? i}
            href={stat?.href ?? "#"}
            className="rounded-2xl border border-line bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="text-2xl font-bold text-ink">{loading || !stat ? "—" : stat.value}</div>
            <div className="mt-1 truncate text-xs text-ink-soft">{loading || !stat ? "Loading…" : stat.label}</div>
          </Link>
        );
      })}
    </div>
  );
}

function RecruiterKpis() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withAuth((token) => getDashboardSummary(token))
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StatRow stats={summary?.overview_stats ?? []} loading={loading} />
      <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Placements trend</h2>
          {loading || !summary ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : (
            <PlacementsChart data={summary.placements_trend} />
          )}
        </div>
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Pipeline</h2>
          {loading || !summary ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : (
            <PipelineWidget stages={summary.pipeline_stages} />
          )}
        </div>
      </div>
    </>
  );
}

function FinanceAdminKpis() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<PayrollBenefitsDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withAuth((token) => getPayrollBenefitsDashboardSummary(token))
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trend = summary?.payroll_trend.map((p) => ({ month: p.label, value: p.value })) ?? [];

  return (
    <>
      <StatRow stats={summary?.overview_stats ?? []} loading={loading} />
      <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Payroll trend</h2>
          {loading || !summary || trend.length === 0 ? (
            <p className="text-sm text-ink-soft">{loading ? "Loading…" : "No payroll runs yet."}</p>
          ) : (
            <PlacementsChart data={trend} />
          )}
        </div>
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Benefit cost by type</h2>
          {loading || !summary || summary.benefit_cost_by_type.length === 0 ? (
            <p className="text-sm text-ink-soft">{loading ? "Loading…" : "No enrollments yet."}</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {summary.benefit_cost_by_type.slice(0, 5).map((b) => {
                const max = Math.max(...summary.benefit_cost_by_type.map((x) => x.value), 1);
                return (
                  <div key={b.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-ink">{b.label}</span>
                      <span className="text-ink-soft">${b.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(b.value / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ItManagerKpis() {
  const { withAuth } = useAuth();
  const [summary, setSummary] = useState<ItAssetsDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withAuth((token) => getItAssetsDashboardSummary(token))
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StatRow stats={summary?.overview_stats ?? []} loading={loading} />
      <div className="mb-10 rounded-2xl border border-line bg-card p-6">
        <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Fleet health</h2>
        {loading || !summary ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {summary.kpis.map((k) => (
              <Link key={k.label} href={k.href} className="rounded-xl border border-line bg-cream px-3.5 py-3 transition-colors hover:border-primary/40">
                <div className="text-lg font-bold text-ink">{k.value}</div>
                <div className="mt-0.5 text-[11px] text-ink-soft">{k.label}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function DepartmentHeadKpis() {
  const { withAuth } = useAuth();
  const [people, setPeople] = useState<PeopleDashboardSummary | null>(null);
  const [talent, setTalent] = useState<TalentDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withAuth((token) => Promise.all([getPeopleDashboardSummary(token), getTalentDashboardSummary(token)]))
      .then(([p, t]) => {
        setPeople(p);
        setTalent(t);
      })
      .catch(() => {
        setPeople(null);
        setTalent(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="mb-6 rounded-2xl border border-line bg-card p-5 text-sm text-ink-soft">
        Your most central daily tool is the{" "}
        <Link href="/dashboard/employee-database" className="font-semibold text-primary hover:text-primary-dark">
          Employee Database
        </Link>
        , scoped to your own department.
      </div>
      <StatRow stats={people?.kpis.map((k) => ({ ...k, change: "" })) ?? []} loading={loading} />
      <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Status breakdown</h2>
          {loading || !people || people.status_breakdown.length === 0 ? (
            <p className="text-sm text-ink-soft">{loading ? "Loading…" : "No employees on file yet."}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {people.status_breakdown.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{s.label}</span>
                  <span className="font-semibold text-ink-soft">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Talent overview</h2>
          {loading || !talent ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {talent.overview_stats.slice(0, 4).map((s) => (
                <div key={s.label}>
                  <div className="text-lg font-bold text-ink">{s.value}</div>
                  <div className="text-[11px] text-ink-soft">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AuditorKpis() {
  const { withAuth } = useAuth();
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withAuth((token) => getOrgHealth(token))
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <HealthGauge title="Org health" health={health} loading={loading} />
      <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
        <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">Flags across every module</h2>
        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : !health || health.flags.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing flagged — every module reads clean right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {health.flags.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm text-ink">{f.label}</div>
                  <div className="text-[11px] text-ink-soft">{f.module}</div>
                </div>
                <span className="shrink-0 rounded-full bg-maroon-soft px-2.5 py-1 text-[11px] font-semibold text-maroon">{f.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const narrowRoleDescriptions: Partial<Record<UserRole, string>> = {
  Recruiter: "Your pipeline, at a glance.",
  "Finance Admin": "Payroll and benefits, at a glance.",
  "IT Manager": "Your device fleet, at a glance.",
  "Department Head": "Your department, at a glance.",
  Auditor: "Read-everywhere across every module — here's what's flagged.",
};

function NarrowRoleHome({ firstName, role }: { firstName: string; role: UserRole }) {
  const visibleKeys = visibleModuleKeysFor(role);
  const visibleModules = modules.filter((m) => !visibleKeys || visibleKeys.includes(m.key));

  return (
    <div className="-m-4 bg-white sm:-m-6">
      <WelcomeBanner name={firstName} role={role} description={narrowRoleDescriptions[role] ?? "Pick up where you left off."} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {role === "Recruiter" && <RecruiterKpis />}
        {role === "Finance Admin" && <FinanceAdminKpis />}
        {role === "IT Manager" && <ItManagerKpis />}
        {role === "Department Head" && <DepartmentHeadKpis />}
        {role === "Auditor" && <AuditorKpis />}

        <h2 className="mb-4 font-display text-lg font-bold text-ink">All modules</h2>
        <ModuleCardsGrid items={visibleModules} />
      </div>
    </div>
  );
}

function EmployeeHome({ firstName }: { firstName: string }) {
  const { withAuth, user } = useAuth();
  const [data, setData] = useState<MyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const dashboard = await withAuth((token) => getMyDashboard(token));
      setData(dashboard);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="-m-4 sm:-m-6">
      <WelcomeBanner
        name={firstName}
        role={user?.role}
        description="Here's what's on your plate today."
        notificationCount={data?.work_health.flags.length}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
          <span>{today}</span>
        </div>
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <HealthGauge title="My work health" health={data?.work_health ?? null} loading={loading} />
          <div className="rounded-2xl border border-line bg-card p-6 lg:col-span-2">
            <h2 className="mb-4 font-display text-sm font-bold text-ink uppercase tracking-wide">This month</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-2xl font-bold text-ink">{data?.this_month.hours_logged ?? 0}</div>
                <div className="text-[11px] text-ink-soft">Hours logged</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-ink">{data?.this_month.approved_leave_requests ?? 0}</div>
                <div className="text-[11px] text-ink-soft">Leave requests approved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-ink">{data?.this_month.current_pay_period ?? "—"}</div>
                <div className="text-[11px] text-ink-soft">Current pay period</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-ink">{data?.this_month.goal_progress ?? 0}%</div>
                <div className="text-[11px] text-ink-soft">Goal progress</div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mb-4 font-display text-lg font-bold text-ink">All modules</h2>
        <ModuleCardsGrid items={modules} />

        <div className="mt-10 mb-6">
          <PendingTasksCard tasks={data?.pending_tasks ?? []} loading={loading} />
        </div>

        {/* Clock in/out stays here as a daily quick-action — everything else
            (goals, onboarding checklist, benefit claims, support tickets)
            now lives inside its own module page, reachable via the grid
            above, rather than being duplicated on this dashboard too. */}
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

          <RecentActivityCard items={data?.recent_activity ?? []} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardHubPage() {
  const { user } = useAuth();
  const firstName = (user ? [user.first_name].filter(Boolean).join(" ") || user.username : "") || "there";

  // Contractor is "a restricted Employee variant" per the Control
  // Hierarchy Matrix — same self-service home (clock-in, goals, etc, all
  // already gated to Employee-or-Contractor server-side in
  // core/my_views.py), narrower access enforced within each module
  // instead of a different landing page.
  if (user?.role === "Employee" || user?.role === "Contractor") return <EmployeeHome firstName={firstName} />;
  if (user?.role && NARROW_ROLES.includes(user.role)) return <NarrowRoleHome firstName={firstName} role={user.role} />;
  return <HrHome firstName={firstName} />;
}

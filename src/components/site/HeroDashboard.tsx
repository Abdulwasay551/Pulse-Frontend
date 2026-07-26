import type { Notification, PlacementPoint } from "@/lib/cms";
import AnimatedNumber from "./AnimatedNumber";
import AttendanceBar from "./AttendanceBar";

const toneAvatar: Record<Notification["tone"], string> = {
  primary: "bg-primary-light text-primary-dark",
  amber: "bg-amber text-cream",
  maroon: "bg-maroon text-cream",
  neutral: "bg-ink-soft text-cream",
};

const tonePill: Record<Notification["tone"], string> = {
  primary: "bg-primary-light/20 text-primary-light",
  amber: "bg-amber/25 text-amber-soft",
  maroon: "bg-maroon/25 text-maroon-soft",
  neutral: "bg-cream/20 text-cream/70",
};

export default function HeroDashboard({
  totalPlacements,
  growthLabel,
  placements,
  notifications,
  payrollLabel,
  payrollAmount,
  payrollSubtext,
  payrollStatus,
  attendancePercent,
  attendanceSubtext,
}: {
  totalPlacements: number;
  growthLabel: string;
  placements: PlacementPoint[];
  notifications: Notification[];
  payrollLabel: string;
  payrollAmount: string;
  payrollSubtext: string;
  payrollStatus: string;
  attendancePercent: number;
  attendanceSubtext: string;
}) {
  const maxValue = Math.max(...placements.map((p) => p.value), 1);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-primary-dark p-6 shadow-2xl shadow-primary-dark/30 sm:p-7">
      <div className="mb-5 flex items-center justify-between text-[11px] uppercase tracking-wider text-primary-light/70">
        <span>Recruiting desk — live</span>
        <span className="flex items-center gap-1.5 text-primary-light">
          <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-primary-light" />
          live
        </span>
      </div>

      {/* Placements chart */}
      <div className="mb-2 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-cream/50">
            Placements · last 6 months
          </div>
          <div className="text-2xl font-bold tabular-nums text-cream">
            <AnimatedNumber value={totalPlacements} />
          </div>
        </div>
        <span className="rounded-full bg-primary-light/15 px-2.5 py-1 text-[10.5px] font-semibold text-primary-light">
          {growthLabel}
        </span>
      </div>
      <div className="flex h-24 items-stretch gap-2.5">
        {placements.map((p, i) => (
          <div key={p.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className={`animate-bar-grow w-full rounded-t-md ${
                  i === placements.length - 1 ? "bg-primary-light" : "bg-cream/25"
                }`}
                style={{
                  height: `${(p.value / maxValue) * 100}%`,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            </div>
            <span className="text-[9.5px] text-cream/40">{p.month}</span>
          </div>
        ))}
      </div>

      {/* Notification ticker */}
      <div className="relative mt-6 h-16 overflow-hidden rounded-xl bg-cream/5">
        {notifications.map((n, i) => (
          <div
            key={n.name}
            className="animate-notif-cycle absolute inset-0 flex items-center gap-3 px-3.5 opacity-0"
            style={{ animationDelay: `${i * 1.8}s` }}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${toneAvatar[n.tone]}`}
            >
              {n.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-cream">{n.name}</div>
              <div className="truncate text-[11.5px] text-cream/45">{n.role}</div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap ${tonePill[n.tone]}`}
            >
              {n.status}
            </span>
          </div>
        ))}
      </div>

      {/* Payroll + attendance strip */}
      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-cream/10 pt-5 sm:grid-cols-2">
        <div className="rounded-xl bg-cream/5 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-cream/50">
              {payrollLabel}
            </span>
            <span className="rounded-full bg-primary-light/15 px-2 py-0.5 text-[9.5px] font-semibold text-primary-light">
              {payrollStatus}
            </span>
          </div>
          <div className="mt-1.5 text-lg font-bold tabular-nums text-cream">{payrollAmount}</div>
          <div className="text-[11px] text-cream/40">{payrollSubtext}</div>
        </div>

        <div className="rounded-xl bg-cream/5 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-cream/50">
              Attendance · this week
            </span>
            <span className="text-[11px] font-semibold text-cream">
              <AnimatedNumber value={attendancePercent} suffix="%" />
            </span>
          </div>
          <AttendanceBar percent={attendancePercent} />
          <div className="mt-1.5 text-[11px] text-cream/40">{attendanceSubtext}</div>
        </div>
      </div>
    </div>
  );
}

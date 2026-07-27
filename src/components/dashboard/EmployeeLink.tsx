import Link from "next/link";
import type { EmployeeLite } from "@/lib/people-api";

/** The standard avatar-badge + name cell used across every table that
 * references an employee — now a link to that employee's record on the
 * Employee Database (`?employee=<id>` auto-opens their edit modal there),
 * so a name is never just inert text. */
export default function EmployeeLink({
  employee,
  subtitle,
}: {
  employee: EmployeeLite;
  subtitle?: string;
}) {
  return (
    <Link href={`/dashboard/employee-database?employee=${employee.id}`} className="group/emp flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
        {employee.initials}
      </span>
      <div className="min-w-0">
        <div className="truncate font-semibold text-ink group-hover/emp:text-primary group-hover/emp:underline">
          {employee.name}
        </div>
        {subtitle && <div className="truncate text-xs text-ink-soft">{subtitle}</div>}
      </div>
    </Link>
  );
}

import { Banknote, Briefcase, Cpu, Globe2, HeartPulse, LayoutGrid, Handshake, type LucideIcon } from "lucide-react";
import type { WidgetType } from "./widgets";

const iconByType: Record<WidgetType, LucideIcon> = {
  pipeline: LayoutGrid,
  payroll: Banknote,
  it: Cpu,
  benefits: HeartPulse,
  hire: Briefcase,
  mobility: Globe2,
  deals: Handshake,
  none: LayoutGrid,
};

export default function ProductIcon({
  type,
  className = "h-9 w-9",
  toneClassName = "bg-primary/10 text-primary",
}: {
  type: WidgetType;
  className?: string;
  toneClassName?: string;
}) {
  const Icon = iconByType[type] ?? LayoutGrid;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${toneClassName} ${className}`}
    >
      <Icon className="h-[52%] w-[52%]" strokeWidth={2} />
    </div>
  );
}

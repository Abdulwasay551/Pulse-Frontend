import ModuleHeader from "@/components/dashboard/ModuleHeader";
import ModuleFeatureSections from "@/components/dashboard/ModuleFeatureSections";
import { dashboardModules } from "@/lib/dashboard-modules";

const moduleDef = dashboardModules.find((m) => m.key === "talent")!;

export default function TalentManagementPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader icon={moduleDef.icon} title={moduleDef.label} description={moduleDef.description} />
      <ModuleFeatureSections moduleDef={moduleDef} />
    </div>
  );
}

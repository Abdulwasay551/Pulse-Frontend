import { BadgeCheck, Boxes, History, Laptop, LifeBuoy, PlugZap, Smartphone, TrendingDown } from "lucide-react";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureSection from "@/components/dashboard/FeatureSection";
import FeatureTile from "@/components/dashboard/FeatureTile";

export default function ItAssetManagementPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader
        icon={Laptop}
        title="EVO-IT & Asset Management"
        description="Device lifecycle, support tickets, and compliance."
      />

      <FeatureSection title="Device lifecycle">
        <FeatureTile icon={PlugZap} title="Provisioning & deprovisioning" description="Tied to onboarding and offboarding." />
        <FeatureTile icon={Boxes} title="Asset inventory" description="Laptops, monitors, and every assigned device." />
        <FeatureTile icon={BadgeCheck} title="Warranty tracking" description="Know what's covered, and until when." />
      </FeatureSection>

      <FeatureSection title="Support & compliance">
        <FeatureTile icon={LifeBuoy} title="IT support tickets" description="Device queries and repair requests." />
        <FeatureTile icon={History} title="Device tracker" description="Issue history, repairs, and damage records." />
        <FeatureTile icon={Smartphone} title="BYOD security policy" description="Track policy compliance per device." />
        <FeatureTile icon={TrendingDown} title="Asset depreciation" description="Depreciation records synced to finance." />
      </FeatureSection>
    </div>
  );
}

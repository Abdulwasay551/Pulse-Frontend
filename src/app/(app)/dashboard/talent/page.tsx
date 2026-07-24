import { GraduationCap, Grid3x3, Layers, Map, Sparkles, Star, Target, TrendingUp } from "lucide-react";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureSection from "@/components/dashboard/FeatureSection";
import FeatureTile from "@/components/dashboard/FeatureTile";

export default function TalentManagementPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader
        icon={TrendingUp}
        title="EVO-Talent Management"
        description="Goals, appraisals, learning, and succession planning."
      />

      <FeatureSection title="Goals & appraisal">
        <FeatureTile icon={Target} title="Goal setting & KPIs" description="Set and track goals per employee." />
        <FeatureTile icon={Star} title="Performance appraisals" description="Yearly 360° feedback cycles." />
        <FeatureTile icon={Layers} title="Competency mapping" description="Map skills against role expectations." />
        <FeatureTile
          icon={Sparkles}
          title="Value-addition scoring"
          description="Performance scoring powered by EVO-AI."
        />
      </FeatureSection>

      <FeatureSection title="Learning & growth">
        <FeatureTile icon={GraduationCap} title="Learning Management System" description="Training and course delivery." />
        <FeatureTile icon={Map} title="Career development paths" description="Mapped per department hierarchy." />
        <FeatureTile icon={Grid3x3} title="Succession planning" description="9-box grid and succession candidates." />
      </FeatureSection>
    </div>
  );
}

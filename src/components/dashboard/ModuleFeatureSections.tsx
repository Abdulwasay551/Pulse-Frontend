import FeatureSection from "@/components/dashboard/FeatureSection";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { featureHref, type ModuleDef } from "@/lib/dashboard-modules";

/** Renders every section/feature tile for a module straight from
 * `dashboardModules` — the same data `Sidebar` reads — so a hub page's tiles
 * and its sidebar submenu can never drift out of sync with each other. */
export default function ModuleFeatureSections({ moduleDef }: { moduleDef: ModuleDef }) {
  return (
    <>
      {moduleDef.sections.map((section) => (
        <FeatureSection key={section.label} title={section.label}>
          {section.features.map((feature) => (
            <FeatureTile
              key={feature.label}
              icon={feature.icon}
              title={feature.label}
              description={feature.description}
              href={featureHref(moduleDef, section, feature)}
              comingSoon={!feature.href}
            />
          ))}
        </FeatureSection>
      ))}
    </>
  );
}

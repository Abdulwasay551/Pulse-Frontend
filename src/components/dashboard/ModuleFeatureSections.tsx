"use client";

import FeatureSection from "@/components/dashboard/FeatureSection";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { featureHref, type ModuleDef } from "@/lib/dashboard-modules";
import { filterSectionsForRole } from "@/lib/role-access";

/** Renders every section/feature tile for a module straight from
 * `dashboardModules` — the same data `Sidebar` reads — so a hub page's tiles
 * and its sidebar submenu can never drift out of sync with each other.
 * Filtered per role, same as Sidebar/Topbar, so a narrower role never sees
 * a tile for something outside their ROLE_ALLOWED_PATHS slice. */
export default function ModuleFeatureSections({ moduleDef }: { moduleDef: ModuleDef }) {
  const { user } = useAuth();
  const visibleSections = filterSectionsForRole(moduleDef.sections, user?.role);

  return (
    <>
      {visibleSections.map((section) => (
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

const CMS_API_BASE = process.env.CMS_API_URL ?? "http://localhost:8000/api/cms/v2";

// Revalidate fetched CMS content periodically rather than on every request.
const REVALIDATE_SECONDS = 60;

type StreamItem<T> = { type: string; value: T; id: string };

function sv<T>(items: StreamItem<T>[] | undefined): T[] {
  return (items ?? []).map((item) => item.value);
}

export type Tone = "primary" | "amber" | "maroon" | "neutral";
export type WidgetType =
  | "none"
  | "pipeline"
  | "payroll"
  | "it"
  | "benefits"
  | "hire"
  | "mobility"
  | "deals";

export interface PlacementPoint {
  month: string;
  value: number;
}

export interface Notification {
  initials: string;
  name: string;
  role: string;
  status: string;
  tone: Tone;
}

export interface DemoRow {
  label: string;
  status: string;
  tone: Tone;
}

export interface StageCount {
  label: string;
  count: number;
}

export interface SkillBar {
  label: string;
  percent: number;
}

export interface HomePageData {
  hero_eyebrow: string;
  hero_heading_pre: string;
  hero_heading_highlight: string;
  hero_heading_post: string;
  hero_subtitle: string;
  hero_cta_primary_label: string;
  hero_cta_secondary_label: string;
  hero_note: string;
  dashboard_total_placements: number;
  dashboard_growth_label: string;
  dashboard_placements: StreamItem<PlacementPoint>[];
  dashboard_notifications: StreamItem<Notification>[];
  dashboard_payroll_label: string;
  dashboard_payroll_amount: string;
  dashboard_payroll_subtext: string;
  dashboard_payroll_status: string;
  dashboard_attendance_percent: number;
  dashboard_attendance_subtext: string;
  trust_logos: StreamItem<string>[];
  suite_eyebrow: string;
  suite_title: string;
  suite_subtitle: string;
}

export interface Product {
  id: number;
  sort_order: number;
  tag: string;
  name: string;
  short_description: string;
  long_description: string;
  bullets: StreamItem<string>[];
  widget_type: WidgetType;
  widget_rows: StreamItem<DemoRow>[];
  widget_stages: StreamItem<StageCount>[];
  widget_skills: StreamItem<SkillBar>[];
}

export interface PricingTier {
  name: string;
  description: string;
  is_custom: boolean;
  monthly_price: number | null;
  annual_price: number | null;
  featured: boolean;
  cta_label: string;
  features: string[];
}

export type ComparisonValue = "yes" | "partial" | "no";

export interface ComparisonRow {
  feature: string;
  starter: ComparisonValue;
  growth: ComparisonValue;
  enterprise: ComparisonValue;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PricingPageData {
  eyebrow: string;
  heading: string;
  subtitle: string;
  tiers: StreamItem<PricingTier>[];
  comparison_rows: StreamItem<ComparisonRow>[];
  faq_items: StreamItem<FaqItem>[];
}

export interface SolutionsPageData {
  eyebrow: string;
  heading: string;
  subtitle: string;
}

export interface UseCase {
  tag: string;
  title: string;
  description: string;
  stat: string;
  stat_label: string;
  bullets: string[];
}

export interface UseCasesPageData {
  eyebrow: string;
  heading: string;
  subtitle: string;
  cases: StreamItem<UseCase>[];
  shift_eyebrow: string;
  shift_title: string;
  before_items: StreamItem<string>[];
  after_items: StreamItem<string>[];
}

export interface Role {
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  widget_type: WidgetType;
  widget_rows: DemoRow[];
  widget_stages: StageCount[];
  widget_skills: SkillBar[];
}

export interface WhoWeServePageData {
  eyebrow: string;
  heading: string;
  subtitle: string;
  roles: StreamItem<Role>[];
}

export interface ResourceItem {
  title: string;
  meta: string;
}

export interface ResourcesPageData {
  eyebrow: string;
  heading: string;
  subtitle: string;
  blog_posts: StreamItem<ResourceItem>[];
  guides: StreamItem<ResourceItem>[];
  help_articles: StreamItem<ResourceItem>[];
  api_docs_title: string;
  api_docs_description: string;
  api_docs_snippet: string;
}

export interface FooterColumn {
  heading: string;
  url: string;
  links: string[];
}

export interface SiteSettingsData {
  footer_tagline: string;
  copyright_holder: string;
  footer_columns: StreamItem<FooterColumn>[];
  cta_default_title: string;
  cta_default_subtitle: string;
}

async function cmsFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${CMS_API_BASE}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`CMS fetch failed (${res.status}): ${path}`);
  }
  return res.json();
}

export async function getPage<T>(pageType: string): Promise<T> {
  const data = await cmsFetch<{ items: T[] }>(`/pages/?type=cms.${pageType}&fields=*`);
  return data.items[0];
}

export async function getProducts(): Promise<Product[]> {
  const data = await cmsFetch<{ items: Product[] }>("/products/?fields=*&order=sort_order");
  return data.items;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  const data = await cmsFetch<{ items: SiteSettingsData[] }>("/site-settings/?fields=*");
  return data.items[0];
}

// Used by the /preview route: fetches a *draft* page by the token Wagtail's
// admin generates when an editor clicks "Preview" — always fresh, never the
// 60s-revalidate cache the live pages use, since a stale preview would be
// actively misleading to whoever is checking their edits.
export async function getPagePreview<T>(contentType: string, token: string): Promise<T> {
  const res = await fetch(
    `${CMS_API_BASE}/page_preview/?content_type=${encodeURIComponent(contentType)}&token=${encodeURIComponent(token)}&fields=*`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`Preview fetch failed (${res.status})`);
  }
  return res.json();
}

export { sv };

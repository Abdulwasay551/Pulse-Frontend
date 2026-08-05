export type IntegrationComplexity = "Low" | "Medium" | "Medium-High" | "High" | "Very High";
export type IntegrationPricingTier = "Free" | "Freemium" | "Paid";

export interface IntegrationEntry {
  module: string;
  name: string;
  complexity: IntegrationComplexity;
  estimate: string;
  /** Why it lands at that complexity/estimate — mostly driven by whether
   * the vendor has a real, documented public API vs. requiring partner
   * approval, sales-negotiated access, or no API at all. */
  note: string;
  /** Whether the *vendor's API itself* is free to call, gated behind a
   * paid plan/subscription on their side, or somewhere in between (free
   * API, but the underlying account/platform it talks to is paid). This is
   * about their pricing, not ours — nothing here is billed by EvoHR. */
  pricingTier: IntegrationPricingTier;
  pricingNote: string;
}

// A planning-stage catalog, not live connections — none of these are wired
// up yet. Complexity/estimate reflect how each vendor's own API/partner
// program works today, not app-side effort alone (several of these are
// gated by the vendor's approval process more than by engineering work).
export const integrationsCatalog: IntegrationEntry[] = [
  { module: "Sourcing", name: "ZipRecruiter / Glassdoor", complexity: "High", estimate: "4–6 weeks", note: "Two separate partner APIs; distribution-partner approval required for both.", pricingTier: "Paid", pricingNote: "No self-serve API pricing — distribution access is a negotiated partner agreement." },
  { module: "Sourcing", name: "Indeed", complexity: "Medium-High", estimate: "3–4 weeks", note: "Documented Employer/Publisher API, but partner API access needs approval.", pricingTier: "Free", pricingNote: "API access itself is free; sponsored job budget is separate ad spend, not an API fee." },
  { module: "Sourcing", name: "LinkedIn Recruiter", complexity: "Very High", estimate: "6–8+ weeks", note: "Talent/Recruiter API is invite-only via LinkedIn's Partner Program — approval time dominates.", pricingTier: "Paid", pricingNote: "Requires a paid LinkedIn Recruiter seat license (~$1,000+/month) plus separate Partner Program approval." },
  { module: "Sourcing", name: "Rozee.pk", complexity: "Medium-High", estimate: "3–5 weeks", note: "No robust public API; likely needs a direct feed/data-sharing arrangement with Rozee.", pricingTier: "Paid", pricingNote: "No public API pricing published — would be a custom, negotiated data-sharing agreement." },
  { module: "Screening", name: "HackerRank", complexity: "Medium", estimate: "2–3 weeks", note: "Well-documented REST API (tests, invites, webhook results).", pricingTier: "Paid", pricingNote: "API access is bundled with a paid HackerRank for Work subscription tier." },
  { module: "Screening", name: "Criteria Corp", complexity: "Medium", estimate: "2–3 weeks", note: "Assessment API/webhooks, similar shape to HackerRank.", pricingTier: "Paid", pricingNote: "Enterprise assessment platform — API access via a paid, sales-quoted plan." },
  { module: "Scheduling & Interviews", name: "Google Meet", complexity: "Low", estimate: "1 week", note: "No separate API — a Meet link is just conferenceData on a Calendar event.", pricingTier: "Free", pricingNote: "Free within Google Calendar API's standard quota." },
  { module: "Scheduling & Interviews", name: "Google Calendar", complexity: "Low", estimate: "1–2 weeks", note: "Mature, well-documented OAuth + Calendar API.", pricingTier: "Free", pricingNote: "Free within standard quota; a Google Workspace subscription is only needed for the org's own accounts." },
  { module: "People Management Module", name: "Google Workspace", complexity: "Medium-High", estimate: "3–4 weeks", note: "Admin SDK Directory API needs domain-wide delegation from the customer's Workspace admin.", pricingTier: "Freemium", pricingNote: "Admin SDK API is free; requires the customer to already have a paid Google Workspace subscription." },
  { module: "People Management Module", name: "Slack", complexity: "Medium", estimate: "1–2 weeks", note: "OAuth + Bot/webhook API, one of the more approachable integrations here.", pricingTier: "Free", pricingNote: "Slack's Web API and bot/webhook access are free on any plan, including free workspaces." },
  { module: "People Management Module", name: "DocuSign", complexity: "Medium", estimate: "2–3 weeks", note: "Standard eSignature REST API, common integration pattern.", pricingTier: "Paid", pricingNote: "Requires one of DocuSign's paid, API-enabled plans — not included on personal/free tiers." },
  { module: "People Management Module", name: "Google Workspace SSO", complexity: "Medium", estimate: "2–3 weeks", note: "Standard SAML/OIDC SSO — most of the work is the customer's own Workspace admin config.", pricingTier: "Freemium", pricingNote: "SSO config is free; requires the customer's existing paid Google Workspace subscription." },
  { module: "People Management Module", name: "NADRA Linked ID Verification", complexity: "Very High", estimate: "8–12+ weeks", note: "No standard public API — requires a direct government/vendor agreement and compliance review, not just engineering.", pricingTier: "Paid", pricingNote: "Government identity-verification service — typically a per-verification fee under a formal agreement." },
  { module: "People Management Module", name: "SurveyMonkey", complexity: "Low", estimate: "1–2 weeks", note: "Straightforward REST API for surveys + responses.", pricingTier: "Paid", pricingNote: "API access requires a paid SurveyMonkey Team/Enterprise plan." },
  { module: "People Management Module", name: "Zapier", complexity: "Medium", estimate: "2–3 weeks", note: "Requires building and publishing our own triggers/actions on Zapier's platform.", pricingTier: "Free", pricingNote: "Free to build and publish an integration; end users may need a paid Zapier plan for higher usage." },
  { module: "Talent Management Module", name: "LinkedIn Learning", complexity: "Medium-High", estimate: "3–4 weeks", note: "Content/reporting API, requires a LinkedIn Learning partner relationship.", pricingTier: "Paid", pricingNote: "Requires an existing LinkedIn Learning subscription plus partner API access." },
  { module: "Talent Management Module", name: "Coursera for Business", complexity: "Medium-High", estimate: "3–4 weeks", note: "Enterprise reporting API, partner access needed.", pricingTier: "Paid", pricingNote: "Reporting API is bundled with a paid Coursera for Business subscription." },
  { module: "Talent Management Module", name: "Udemy Business", complexity: "Medium", estimate: "2–3 weeks", note: "Admin API for enterprise accounts (provisioning + completion reporting).", pricingTier: "Paid", pricingNote: "Admin API is bundled with a paid Udemy Business subscription." },
  { module: "Talent Management Module", name: "Google Meet Live Training", complexity: "Low", estimate: "1 week", note: "Same mechanism as Google Meet above, reused for scheduled training sessions.", pricingTier: "Free", pricingNote: "Same as Google Meet — free within standard Calendar API quota." },
  { module: "Payroll & Benefits Module", name: "Deel", complexity: "Medium-High", estimate: "3–4 weeks", note: "Modern, well-documented EOR/payroll API.", pricingTier: "Freemium", pricingNote: "API access itself is free; Deel charges its normal per-worker EOR/payroll processing fees." },
  { module: "Payroll & Benefits Module", name: "Remote", complexity: "Medium-High", estimate: "3–4 weeks", note: "Similar EOR/payroll API shape to Deel.", pricingTier: "Freemium", pricingNote: "API access itself is free; Remote charges its normal per-employee EOR fees." },
  { module: "Payroll & Benefits Module", name: "Papaya Global", complexity: "High", estimate: "4–6 weeks", note: "Enterprise-oriented; API access is typically sales-negotiated.", pricingTier: "Paid", pricingNote: "Enterprise global payroll platform — pricing and API access are sales-quoted." },
  { module: "Payroll & Benefits Module", name: "Gusto", complexity: "Medium", estimate: "2–3 weeks", note: "Popular, well-documented Partner/Embedded API.", pricingTier: "Freemium", pricingNote: "Gusto Embedded API access is free to integrate; usage fees apply per company run through it." },
  { module: "Payroll & Benefits Module", name: "ZenHR", complexity: "Medium-High", estimate: "3–4 weeks", note: "Regional (MENA) platform; API exists but documentation is less standardized.", pricingTier: "Paid", pricingNote: "API access is bundled with a paid ZenHR platform subscription." },
  { module: "Payroll & Benefits Module", name: "Bayzat", complexity: "Medium-High", estimate: "3–4 weeks", note: "Regional (Gulf) platform, partner API access.", pricingTier: "Paid", pricingNote: "API access is bundled with a paid Bayzat platform subscription." },
  { module: "Payroll & Benefits Module", name: "Wise", complexity: "Medium", estimate: "2–3 weeks", note: "Well-documented Wise Platform API for international payouts.", pricingTier: "Freemium", pricingNote: "API access is free; Wise charges its normal small per-transfer fee." },
  { module: "Direct Payroll", name: "Xero Payroll", complexity: "Medium", estimate: "2–3 weeks", note: "Documented OAuth2 API; payroll endpoints vary by region.", pricingTier: "Freemium", pricingNote: "API access is free; requires the customer's existing paid Xero subscription." },
  { module: "Direct Payroll", name: "Sage Payroll", complexity: "Medium", estimate: "2–3 weeks", note: "API varies by Sage product/region, reasonably documented.", pricingTier: "Freemium", pricingNote: "API access is free; requires the customer's existing paid Sage subscription." },
  { module: "Direct Payroll", name: "QuickBooks Payroll", complexity: "Medium", estimate: "2–3 weeks", note: "Mature Intuit API, a common integration target.", pricingTier: "Freemium", pricingNote: "API access is free; requires the customer's existing paid QuickBooks Payroll subscription." },
  { module: "IT & Asset Inventory Module", name: "Google Workspace Device Management", complexity: "Medium-High", estimate: "3–4 weeks", note: "Admin SDK Directory API for device inventory, needs domain admin delegation.", pricingTier: "Freemium", pricingNote: "Admin SDK API is free; requires the customer's existing paid Google Workspace subscription." },
];

export const integrationModuleOrder = [
  "Sourcing",
  "Screening",
  "Scheduling & Interviews",
  "People Management Module",
  "Talent Management Module",
  "Payroll & Benefits Module",
  "Direct Payroll",
  "IT & Asset Inventory Module",
];

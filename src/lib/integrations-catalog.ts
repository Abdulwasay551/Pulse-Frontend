export type IntegrationComplexity = "Low" | "Medium" | "Medium-High" | "High" | "Very High";

export interface IntegrationEntry {
  module: string;
  name: string;
  complexity: IntegrationComplexity;
  estimate: string;
  /** Why it lands at that complexity/estimate — mostly driven by whether
   * the vendor has a real, documented public API vs. requiring partner
   * approval, sales-negotiated access, or no API at all. */
  note: string;
}

// A planning-stage catalog, not live connections — none of these are wired
// up yet. Complexity/estimate reflect how each vendor's own API/partner
// program works today, not app-side effort alone (several of these are
// gated by the vendor's approval process more than by engineering work).
export const integrationsCatalog: IntegrationEntry[] = [
  { module: "Sourcing", name: "ZipRecruiter / Glassdoor", complexity: "High", estimate: "4–6 weeks", note: "Two separate partner APIs; distribution-partner approval required for both." },
  { module: "Sourcing", name: "Indeed", complexity: "Medium-High", estimate: "3–4 weeks", note: "Documented Employer/Publisher API, but partner API access needs approval." },
  { module: "Sourcing", name: "LinkedIn Recruiter", complexity: "Very High", estimate: "6–8+ weeks", note: "Talent/Recruiter API is invite-only via LinkedIn's Partner Program — approval time dominates." },
  { module: "Sourcing", name: "Rozee.pk", complexity: "Medium-High", estimate: "3–5 weeks", note: "No robust public API; likely needs a direct feed/data-sharing arrangement with Rozee." },
  { module: "Screening", name: "HackerRank", complexity: "Medium", estimate: "2–3 weeks", note: "Well-documented REST API (tests, invites, webhook results)." },
  { module: "Screening", name: "Criteria Corp", complexity: "Medium", estimate: "2–3 weeks", note: "Assessment API/webhooks, similar shape to HackerRank." },
  { module: "Scheduling & Interviews", name: "Google Meet", complexity: "Low", estimate: "1 week", note: "No separate API — a Meet link is just conferenceData on a Calendar event." },
  { module: "Scheduling & Interviews", name: "Google Calendar", complexity: "Low", estimate: "1–2 weeks", note: "Mature, well-documented OAuth + Calendar API." },
  { module: "People Management Module", name: "Google Workspace", complexity: "Medium-High", estimate: "3–4 weeks", note: "Admin SDK Directory API needs domain-wide delegation from the customer's Workspace admin." },
  { module: "People Management Module", name: "Slack", complexity: "Medium", estimate: "1–2 weeks", note: "OAuth + Bot/webhook API, one of the more approachable integrations here." },
  { module: "People Management Module", name: "DocuSign", complexity: "Medium", estimate: "2–3 weeks", note: "Standard eSignature REST API, common integration pattern." },
  { module: "People Management Module", name: "Google Workspace SSO", complexity: "Medium", estimate: "2–3 weeks", note: "Standard SAML/OIDC SSO — most of the work is the customer's own Workspace admin config." },
  { module: "People Management Module", name: "NADRA Linked ID Verification", complexity: "Very High", estimate: "8–12+ weeks", note: "No standard public API — requires a direct government/vendor agreement and compliance review, not just engineering." },
  { module: "People Management Module", name: "SurveyMonkey", complexity: "Low", estimate: "1–2 weeks", note: "Straightforward REST API for surveys + responses." },
  { module: "People Management Module", name: "Zapier", complexity: "Medium", estimate: "2–3 weeks", note: "Requires building and publishing our own triggers/actions on Zapier's platform." },
  { module: "Talent Management Module", name: "LinkedIn Learning", complexity: "Medium-High", estimate: "3–4 weeks", note: "Content/reporting API, requires a LinkedIn Learning partner relationship." },
  { module: "Talent Management Module", name: "Coursera for Business", complexity: "Medium-High", estimate: "3–4 weeks", note: "Enterprise reporting API, partner access needed." },
  { module: "Talent Management Module", name: "Udemy Business", complexity: "Medium", estimate: "2–3 weeks", note: "Admin API for enterprise accounts (provisioning + completion reporting)." },
  { module: "Talent Management Module", name: "Google Meet Live Training", complexity: "Low", estimate: "1 week", note: "Same mechanism as Google Meet above, reused for scheduled training sessions." },
  { module: "Payroll & Benefits Module", name: "Deel", complexity: "Medium-High", estimate: "3–4 weeks", note: "Modern, well-documented EOR/payroll API." },
  { module: "Payroll & Benefits Module", name: "Remote", complexity: "Medium-High", estimate: "3–4 weeks", note: "Similar EOR/payroll API shape to Deel." },
  { module: "Payroll & Benefits Module", name: "Papaya Global", complexity: "High", estimate: "4–6 weeks", note: "Enterprise-oriented; API access is typically sales-negotiated." },
  { module: "Payroll & Benefits Module", name: "Gusto", complexity: "Medium", estimate: "2–3 weeks", note: "Popular, well-documented Partner/Embedded API." },
  { module: "Payroll & Benefits Module", name: "ZenHR", complexity: "Medium-High", estimate: "3–4 weeks", note: "Regional (MENA) platform; API exists but documentation is less standardized." },
  { module: "Payroll & Benefits Module", name: "Bayzat", complexity: "Medium-High", estimate: "3–4 weeks", note: "Regional (Gulf) platform, partner API access." },
  { module: "Payroll & Benefits Module", name: "Wise", complexity: "Medium", estimate: "2–3 weeks", note: "Well-documented Wise Platform API for international payouts." },
  { module: "Direct Payroll", name: "Xero Payroll", complexity: "Medium", estimate: "2–3 weeks", note: "Documented OAuth2 API; payroll endpoints vary by region." },
  { module: "Direct Payroll", name: "Sage Payroll", complexity: "Medium", estimate: "2–3 weeks", note: "API varies by Sage product/region, reasonably documented." },
  { module: "Direct Payroll", name: "QuickBooks Payroll", complexity: "Medium", estimate: "2–3 weeks", note: "Mature Intuit API, a common integration target." },
  { module: "IT & Asset Inventory Module", name: "Google Workspace Device Management", complexity: "Medium-High", estimate: "3–4 weeks", note: "Admin SDK Directory API for device inventory, needs domain admin delegation." },
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

// Entirely static sample data for the demo dashboard — no backend, no CMS.
// This is a product walkthrough, not a real app: every list here is fake.

export const demoUser = {
  name: "Jordan Blake",
  initials: "JB",
  role: "Senior Recruiter",
  email: "jordan@evohr.demo",
};

export type CandidateStage = "Sourced" | "Interview" | "Offer" | "Placed" | "Rejected";

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  client: string;
  stage: CandidateStage;
  source: string;
  applied: string;
}

export const candidates: Candidate[] = [
  { id: "c1", name: "Ava Thompson", initials: "AT", role: "Senior Backend Engineer", client: "Northbridge Talent", stage: "Interview", source: "LinkedIn", applied: "Jul 14" },
  { id: "c2", name: "Marcus Reed", initials: "MR", role: "Field Sales Rep — West", client: "Fernwood Staffing", stage: "Interview", source: "Referral", applied: "Jul 12" },
  { id: "c3", name: "Priya Nair", initials: "PN", role: "DevOps Lead", client: "Anchorpoint Search", stage: "Offer", source: "Job Board", applied: "Jul 9" },
  { id: "c4", name: "Diego Alvarez", initials: "DA", role: "Support Engineer", client: "Duskline Partners", stage: "Rejected", source: "LinkedIn", applied: "Jul 8" },
  { id: "c5", name: "Lena Novak", initials: "LN", role: "People Ops Coordinator", client: "Cascade Recruiting", stage: "Placed", source: "Referral", applied: "Jun 30" },
  { id: "c6", name: "Sam Okafor", initials: "SO", role: "Frontend Engineer", client: "Northbridge Talent", stage: "Sourced", source: "Sourced", applied: "Jul 16" },
  { id: "c7", name: "Ingrid Voss", initials: "IV", role: "Product Designer", client: "Harborview Group", stage: "Interview", source: "Job Board", applied: "Jul 11" },
  { id: "c8", name: "Tariq Hassan", initials: "TH", role: "Data Analyst", client: "Meridian Staffing", stage: "Sourced", source: "LinkedIn", applied: "Jul 15" },
  { id: "c9", name: "Chloe Bennett", initials: "CB", role: "Account Executive", client: "Fernwood Staffing", stage: "Offer", source: "Referral", applied: "Jul 5" },
  { id: "c10", name: "Ravi Thakur", initials: "RT", role: "QA Engineer", client: "Silverline Talent", stage: "Placed", source: "Job Board", applied: "Jun 22" },
];

export type ClientStatus = "Active" | "Prospect" | "At risk";

export interface Client {
  id: string;
  name: string;
  industry: string;
  openRoles: number;
  contact: string;
  contactEmail: string;
  status: ClientStatus;
}

export const clients: Client[] = [
  { id: "cl1", name: "Northbridge Talent", industry: "Technology", openRoles: 4, contact: "Wren Castillo", contactEmail: "wren@northbridge.demo", status: "Active" },
  { id: "cl2", name: "Fernwood Staffing", industry: "Retail", openRoles: 2, contact: "Owen Faulkner", contactEmail: "owen@fernwood.demo", status: "Active" },
  { id: "cl3", name: "Anchorpoint Search", industry: "Finance", openRoles: 1, contact: "Nadia Brooks", contactEmail: "nadia@anchorpoint.demo", status: "Prospect" },
  { id: "cl4", name: "Duskline Partners", industry: "Healthcare", openRoles: 0, contact: "Miles Sato", contactEmail: "miles@duskline.demo", status: "At risk" },
  { id: "cl5", name: "Cascade Recruiting", industry: "Manufacturing", openRoles: 3, contact: "Bea Larsen", contactEmail: "bea@cascade.demo", status: "Active" },
  { id: "cl6", name: "Harborview Group", industry: "Media", openRoles: 2, contact: "Theo Marsh", contactEmail: "theo@harborview.demo", status: "Prospect" },
];

export type RequisitionStatus = "Open" | "Interviewing" | "Offer stage" | "On hold" | "Filled";

export interface Requisition {
  id: string;
  title: string;
  client: string;
  recruiter: string;
  candidates: number;
  priority: "High" | "Medium" | "Low";
  status: RequisitionStatus;
  posted: string;
}

export const requisitions: Requisition[] = [
  { id: "r1", title: "Senior Backend Engineer", client: "Northbridge Talent", recruiter: "Jordan Blake", candidates: 12, priority: "High", status: "Interviewing", posted: "Jun 28" },
  { id: "r2", title: "Field Sales Rep — West", client: "Fernwood Staffing", recruiter: "Ava Chen", candidates: 8, priority: "Medium", status: "Interviewing", posted: "Jul 2" },
  { id: "r3", title: "DevOps Lead", client: "Anchorpoint Search", recruiter: "Jordan Blake", candidates: 6, priority: "High", status: "Offer stage", posted: "Jun 20" },
  { id: "r4", title: "Product Designer", client: "Harborview Group", recruiter: "Nate Osei", candidates: 15, priority: "Medium", status: "Open", posted: "Jul 10" },
  { id: "r5", title: "Data Analyst", client: "Meridian Staffing", recruiter: "Ava Chen", candidates: 4, priority: "Low", status: "Open", posted: "Jul 15" },
  { id: "r6", title: "Support Engineer", client: "Duskline Partners", recruiter: "Jordan Blake", candidates: 9, priority: "Low", status: "On hold", posted: "Jun 15" },
];

export interface PayrollRun {
  id: string;
  period: string;
  contractors: number;
  amount: string;
  status: "Reconciled" | "Needs review" | "Processing";
}

export const payrollRuns: PayrollRun[] = [
  { id: "p1", period: "July 2026, Run 2", contractors: 42, amount: "$186,400", status: "Reconciled" },
  { id: "p2", period: "July 2026, Run 1", contractors: 40, amount: "$178,900", status: "Reconciled" },
  { id: "p3", period: "Contractor batch #14", contractors: 6, amount: "$24,300", status: "Needs review" },
  { id: "p4", period: "June 2026, Run 2", contractors: 39, amount: "$171,200", status: "Reconciled" },
  { id: "p5", period: "Bonus disbursement — Q2", contractors: 18, amount: "$62,750", status: "Processing" },
];

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  tone: "primary" | "amber" | "maroon" | "neutral";
}

export const activity: ActivityItem[] = [
  { id: "a1", message: "Ava Thompson advanced to Interview for Senior Backend Engineer", time: "12m ago", tone: "primary" },
  { id: "a2", message: "Offer sent to Priya Nair for DevOps Lead", time: "48m ago", tone: "primary" },
  { id: "a3", message: "New requisition opened: Data Analyst at Meridian Staffing", time: "2h ago", tone: "neutral" },
  { id: "a4", message: "Diego Alvarez marked not a fit for Support Engineer", time: "3h ago", tone: "maroon" },
  { id: "a5", message: "Contractor batch #14 payroll needs review", time: "5h ago", tone: "amber" },
  { id: "a6", message: "Lena Novak placed as People Ops Coordinator", time: "1d ago", tone: "primary" },
];

export const placementsTrend = [
  { month: "Feb", value: 14 },
  { month: "Mar", value: 18 },
  { month: "Apr", value: 16 },
  { month: "May", value: 22 },
  { month: "Jun", value: 26 },
  { month: "Jul", value: 31 },
];

export const pipelineStages = [
  { label: "Sourced", count: 24 },
  { label: "Interview", count: 11 },
  { label: "Offer", count: 4 },
  { label: "Placed", count: 8 },
];

export const overviewStats = [
  { label: "Open requisitions", value: "18", change: "+3 this week", href: "/dashboard/requisitions" },
  { label: "Active candidates", value: "47", change: "+9 this week", href: "/dashboard/candidates" },
  { label: "Placements this month", value: "8", change: "+18% vs last month", href: "/dashboard/analytics" },
  { label: "Revenue this month", value: "$142,000", change: "placement fees", href: "/dashboard/payroll" },
];

export const sourceBreakdown = [
  { label: "LinkedIn", percent: 38 },
  { label: "Referral", percent: 27 },
  { label: "Job Boards", percent: 22 },
  { label: "Sourced", percent: 13 },
];

import { apiFetch } from "./auth-api";

// --- HR: employee account provisioning ---

export function sendEmployeeInvite(token: string, data: { employee: number; email: string }) {
  return apiFetch<{ detail: string; signup_link: string }>(
    "/employee-invites/",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export function createEmployeeAccount(token: string, data: { employee: number; username: string; password: string }) {
  return apiFetch<{ detail: string; username: string }>(
    "/employee-accounts/",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

// --- Employee self-service ---

export interface MyDashboard {
  employee: { id: number; name: string; initials: string; job_title: string; department: string };
  attendance_today: { clock_in: string | null; clock_out: string | null } | null;
  goals: {
    id: number;
    title: string;
    status: "Not Started" | "In Progress" | "Completed";
    progress: number;
    target_date: string | null;
  }[];
  recent_activity: { id: string; message: string; time: string; tone: "primary" | "amber" | "maroon" | "neutral" }[];
}

export function getMyDashboard(token: string) {
  return apiFetch<MyDashboard>("/my/dashboard/", { method: "GET" }, token);
}

export interface ClockStatus {
  clock_in: string | null;
  clock_out: string | null;
}

export function clockIn(token: string) {
  return apiFetch<ClockStatus>("/my/clock-in/", { method: "POST" }, token);
}

export function clockOut(token: string) {
  return apiFetch<ClockStatus>("/my/clock-out/", { method: "POST" }, token);
}

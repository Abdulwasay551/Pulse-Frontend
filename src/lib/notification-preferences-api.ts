import { apiFetch } from "./auth-api";

export interface NotificationPreferences {
  new_candidate_applications: boolean;
  requisition_status_changes: boolean;
  payroll_run_reminders: boolean;
  weekly_desk_summary_email: boolean;
}

export function getNotificationPreferences(token: string) {
  return apiFetch<NotificationPreferences>("/notification-preferences/", { method: "GET" }, token);
}

export function updateNotificationPreferences(token: string, updates: Partial<NotificationPreferences>) {
  return apiFetch<NotificationPreferences>(
    "/notification-preferences/",
    { method: "PATCH", body: JSON.stringify(updates) },
    token
  );
}

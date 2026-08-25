import { apiFetch } from "./auth-api";

export interface GoogleConnectUrl {
  auth_url: string;
}

export function getGoogleConnectUrl(token: string) {
  return apiFetch<GoogleConnectUrl>("/integrations/google/connect-url/", { method: "GET" }, token);
}

export interface GoogleStatus {
  connected: boolean;
  email: string | null;
}

export function getGoogleStatus(token: string) {
  return apiFetch<GoogleStatus>("/integrations/google/status/", { method: "GET" }, token);
}

export function disconnectGoogle(token: string) {
  return apiFetch<{ detail: string }>("/integrations/google/disconnect/", { method: "POST" }, token);
}

export interface GoogleCalendarInvite {
  event_link: string;
  meet_link: string;
}

export function sendGoogleCalendarInvite(token: string, taskId: number) {
  return apiFetch<GoogleCalendarInvite>(
    `/recruit/onboarding-tasks/${taskId}/google-calendar-invite/`,
    { method: "POST" },
    token
  );
}

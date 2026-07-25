const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface AuthSession {
  detail: string;
  access: string;
  user: AuthUser;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parseErrorBody(res: Response): Promise<{ message: string; fieldErrors?: Record<string, string[]> }> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { message: res.statusText || "Something went wrong. Please try again." };
  }

  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (typeof obj.detail === "string") return { message: obj.detail };

    // DRF validation errors look like { field: ["message", ...], ... } —
    // surface the first one as the headline message but keep them all so
    // forms can show per-field errors too.
    const fieldErrors: Record<string, string[]> = {};
    let firstMessage: string | undefined;
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value) && value.length > 0) {
        fieldErrors[key] = value.map(String);
        if (!firstMessage) firstMessage = String(value[0]);
      }
    }
    if (firstMessage) return { message: firstMessage, fieldErrors };
  }
  return { message: "Something went wrong. Please try again." };
}

// Client-side only (uses cookies for the refresh token) — unlike lib/cms.ts,
// which is a server-side read helper for the marketing site. Exported so
// lib/api-resource.ts (and every module API built on it) can reuse the same
// request/error-parsing plumbing.
export async function apiFetch<T>(path: string, options: RequestInit = {}, accessToken?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    // The refresh token only ever travels as an httpOnly cookie — this is
    // what lets the browser attach/receive it cross-origin.
    credentials: "include",
  });

  if (!res.ok) {
    const { message, fieldErrors } = await parseErrorBody(res);
    throw new ApiError(message, res.status, fieldErrors);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function register(data: { username: string; email: string; password: string; password2: string }) {
  return apiFetch<AuthSession>("/auth/register/", { method: "POST", body: JSON.stringify(data) });
}

export function login(data: { identifier: string; password: string }) {
  return apiFetch<AuthSession>("/auth/login/", { method: "POST", body: JSON.stringify(data) });
}

export function refresh() {
  return apiFetch<{ access: string }>("/auth/refresh/", { method: "POST" });
}

export function logout() {
  return apiFetch<{ detail: string }>("/auth/logout/", { method: "POST" });
}

export function getMe(accessToken: string) {
  return apiFetch<AuthUser>("/auth/me/", { method: "GET" }, accessToken);
}

export function updateMe(accessToken: string, data: Partial<Pick<AuthUser, "first_name" | "last_name" | "email">>) {
  return apiFetch<AuthUser>("/auth/me/", { method: "PATCH", body: JSON.stringify(data) }, accessToken);
}

export function changePassword(
  accessToken: string,
  data: { old_password: string; new_password: string; new_password2: string }
) {
  return apiFetch<{ detail: string }>(
    "/auth/password/change/",
    { method: "POST", body: JSON.stringify(data) },
    accessToken
  );
}

export function forgotPassword(data: { email: string }) {
  return apiFetch<{ detail: string }>("/auth/password/forgot/", { method: "POST", body: JSON.stringify(data) });
}

export function resetPassword(data: { uid: string; token: string; new_password: string; new_password2: string }) {
  return apiFetch<{ detail: string }>("/auth/password/reset/", { method: "POST", body: JSON.stringify(data) });
}

export function submitDemoRequest(data: {
  full_name: string;
  email: string;
  contact_number: string;
  business_name: string;
  message: string;
}) {
  return apiFetch<{ detail: string }>("/demo-requests/", { method: "POST", body: JSON.stringify(data) });
}

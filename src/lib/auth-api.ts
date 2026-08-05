const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type UserRole = "HR" | "Employee" | "IT Manager" | "Finance Admin" | "Department Head" | "Recruiter";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  // A missing profile (pre-existing accounts) reads as HR with no
  // organization/employee — see the backend's UserSerializer.
  role: UserRole;
  organization: string | null;
  employee: { id: number; name: string } | null;
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
  // FormData (file uploads) needs the browser to set its own multipart
  // boundary in Content-Type — setting it to json here would corrupt the
  // upload.
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
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

// CSV/file export endpoints return an attachment, not JSON — a plain <a
// href> can't attach the Authorization header, so this fetches the blob
// with auth and triggers the browser's normal save-file flow manually.
export async function downloadFile(path: string, accessToken: string, filename: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "include",
  });
  if (!res.ok) {
    const { message } = await parseErrorBody(res);
    throw new ApiError(message, res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function register(data: {
  username: string;
  email: string;
  password: string;
  password2: string;
  organization_name?: string;
  invite_token?: string;
}) {
  return apiFetch<AuthSession>("/auth/register/", { method: "POST", body: JSON.stringify(data) });
}

export interface InviteDetail {
  email: string;
  organization: string;
  employee_name: string;
}

export function getInviteDetail(token: string) {
  return apiFetch<InviteDetail>(`/invites/${token}/`, { method: "GET" });
}

export function login(data: { identifier: string; password: string }) {
  return apiFetch<AuthSession>("/auth/login/", { method: "POST", body: JSON.stringify(data) });
}

// Single-flight guard: refresh tokens are rotated + blacklisted on every
// use (see backend SIMPLE_JWT settings), so two concurrent calls to this
// function — e.g. React Strict Mode's double-invoked mount effect in dev,
// or two API calls 401ing around the same moment and each independently
// triggering withAuth's retry-after-refresh — would race to consume the
// same cookie. Whichever request the server processes second sees an
// already-blacklisted token and fails, and if that failure response is
// what the browser applies last, it wipes the cookie a working session
// had just been issued moments earlier. Coalescing concurrent callers onto
// one in-flight request removes the race entirely.
let refreshInFlight: Promise<{ access: string }> | null = null;

export function refresh() {
  if (!refreshInFlight) {
    refreshInFlight = apiFetch<{ access: string }>("/auth/refresh/", { method: "POST" }).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
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

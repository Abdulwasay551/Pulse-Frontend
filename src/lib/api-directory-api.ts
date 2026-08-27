// Public, unauthenticated — this powers the /api-docs page, which has no
// nav link anywhere and is reachable only by URL (dev reference only).
export interface ApiEndpoint {
  path: string;
  name: string | null;
  methods: string[];
  auth_required: boolean;
  description: string;
}

export interface ApiDirectorySection {
  label: string;
  endpoints: ApiEndpoint[];
}

export interface ApiDirectory {
  sections: ApiDirectorySection[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function getApiDirectory(): Promise<ApiDirectory> {
  const res = await fetch(`${API_BASE}/api-directory/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load the API directory.");
  return res.json();
}

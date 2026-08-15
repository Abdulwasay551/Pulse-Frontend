"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { getAiStatus } from "./ai-api";

interface AiStatusContextValue {
  loading: boolean;
  isFeatureEnabled: (featureKey: string) => boolean;
  refresh: () => void;
}

const AiStatusContext = createContext<AiStatusContextValue | null>(null);

/** Fetched once per session (plus on-demand refresh, e.g. after connecting
 * a provider or hitting a 409 ai_not_configured) — every AI-touched page
 * reads from this instead of calling /ai/status/ itself. */
export function AiStatusProvider({ children }: { children: React.ReactNode }) {
  const { withAuth, status } = useAuth();
  const [features, setFeatures] = useState<Record<string, boolean> | null>(null);

  const refresh = useCallback(() => {
    withAuth((token) => getAiStatus(token))
      .then((data) => setFeatures(data.features))
      .catch(() => setFeatures({}));
  }, [withAuth]);

  useEffect(() => {
    if (status === "authenticated") refresh();
  }, [status, refresh]);

  const isFeatureEnabled = (featureKey: string) => features?.[featureKey] ?? false;

  return (
    <AiStatusContext.Provider value={{ loading: features === null, isFeatureEnabled, refresh }}>
      {children}
    </AiStatusContext.Provider>
  );
}

export function useAiStatus() {
  const ctx = useContext(AiStatusContext);
  if (!ctx) throw new Error("useAiStatus must be used within AiStatusProvider");
  return ctx;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as authApi from "./auth-api";
import type { AuthUser } from "./auth-api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    organization_name?: string;
    invite_token?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  /** Runs an authenticated request with the current access token, silently
   * refreshing once (via the httpOnly refresh cookie) and retrying if the
   * access token had already expired. */
  withAuth: <T>(fn: (accessToken: string) => Promise<T>) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { access } = await authApi.refresh();
        const me = await authApi.getMe(access);
        if (cancelled) return;
        accessTokenRef.current = access;
        setUser(me);
        setStatus("authenticated");
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const withAuth = useCallback(async <T,>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
    if (!accessTokenRef.current) throw new authApi.ApiError("Not authenticated.", 401);
    try {
      return await fn(accessTokenRef.current);
    } catch (err) {
      if (err instanceof authApi.ApiError && err.status === 401) {
        const { access } = await authApi.refresh();
        accessTokenRef.current = access;
        return await fn(access);
      }
      throw err;
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const session = await authApi.login({ identifier, password });
    accessTokenRef.current = session.access;
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      password2: string;
      organization_name?: string;
      invite_token?: string;
    }) => {
      const session = await authApi.register(data);
      accessTokenRef.current = session.access;
      setUser(session.user);
      setStatus("authenticated");
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Clearing local state below is what actually matters for the UI —
      // if the network call fails the cookie will just expire on its own.
    }
    accessTokenRef.current = null;
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout, setUser, withAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

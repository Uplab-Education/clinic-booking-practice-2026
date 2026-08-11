"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppUser } from "./users";

type AuthResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseAuthResponse(response: Response): Promise<AuthResult & { user?: AppUser }> {
  const body = (await response.json()) as {
    user?: AppUser;
    message?: string;
  };

  return {
    ok: response.ok,
    message: body.message,
    user: body.user,
  };
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: AppUser | null;
}) {
  const [user, setUser] = useState<AppUser | null>(initialUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      async login(email, password) {
        const result = await parseAuthResponse(
          await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }),
        );

        if (result.ok && result.user) {
          setUser(result.user);
        }

        return result;
      },
      async register(name, email, password) {
        const result = await parseAuthResponse(
          await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          }),
        );

        if (result.ok && result.user) {
          setUser(result.user);
        }

        return result;
      },
      async logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

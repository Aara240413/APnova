"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface UserData {
  id: number;
  email: string;
  name: string;
  avatar: string;
  reputation: number;
  streak: number;
  badges: string[];
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, name?: string, provider?: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  seeded: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refresh: async () => {},
  seeded: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const ensureSeed = useCallback(async () => {
    if (seeded) return;
    try {
      await fetch("/api/seed", { method: "POST" });
      setSeeded(true);
    } catch {}
  }, [seeded]);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users?id=${user.id}`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("apnova_user", JSON.stringify(data.user));
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    async function init() {
      await ensureSeed();
      try {
        const stored = localStorage.getItem("apnova_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          // Refresh in background
          const res = await fetch(`/api/users?id=${parsed.id}`);
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("apnova_user", JSON.stringify(data.user));
          }
        }
      } catch {}
      setLoading(false);
    }
    init();
  }, [ensureSeed]);

  const login = async (email: string, name?: string, provider?: string) => {
    await ensureSeed();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, provider: provider || "email" }),
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("apnova_user", JSON.stringify(data.user));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("apnova_user");
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, refresh, seeded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "recruiter" | "candidate";

type AuthValue = {
  user: User | null;
  session: Session | null;
  roles: Role[];
  loading: boolean;
  isAdmin: boolean;
  isRecruiter: boolean;
  isStaff: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRoles(userId: string | undefined) {
    if (!userId) {
      setRoles([]);
      return;
    }
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (error) {
      console.error("Failed to load user roles", error);
      setRoles([]);
      return;
    }
    setRoles((data ?? []).map((r) => r.role as Role));
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setLoading(true);
      setSession(next);
      // defer the extra supabase call out of the callback
      setTimeout(() => {
        void loadRoles(next?.user?.id).finally(() => setLoading(false));
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadRoles(data.session?.user?.id).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(() => {
    const isAdmin = roles.includes("admin");
    const isRecruiter = roles.includes("recruiter");
    return {
      user: session?.user ?? null,
      session,
      roles,
      loading,
      isAdmin,
      isRecruiter,
      isStaff: isAdmin || isRecruiter,
      signOut: async () => {
        await supabase.auth.signOut();
        setRoles([]);
      },
      refreshRoles: () => loadRoles(session?.user?.id),
    };
  }, [session, roles, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

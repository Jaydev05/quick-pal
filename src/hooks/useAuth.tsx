import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

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
  refreshRoles: (userId?: string) => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
    const effective: Role[] = [];
    for (const row of data ?? []) {
      const { data: allowed } = await supabase.rpc("has_role", { _user_id: userId, _role: row.role });
      if (allowed) effective.push(row.role);
    }
    setRoles(effective);
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
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
        setRoles([]);
        void navigate({ to: "/auth", replace: true });
      },
      refreshRoles: (userId?: string) => loadRoles(userId ?? session?.user?.id),
    };
  }, [session, roles, loading, queryClient, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

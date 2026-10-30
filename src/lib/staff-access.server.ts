import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { MAIN_ADMIN_EMAIL } from "./staff-access";

export async function assertStaff(client: SupabaseClient<Database>, userId: string, mainOnly = false) {
  const { data: user, error } = await client.auth.getUser();
  if (error || user.user?.id !== userId) throw new Error("Please sign in again.");
  const { data: main } = await client.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (main && user.user.email?.toLowerCase() === MAIN_ADMIN_EMAIL) return "admin" as const;
  if (!mainOnly) {
    const { data: employee } = await client.rpc("has_role", { _user_id: userId, _role: "recruiter" });
    if (employee) return "employee" as const;
  }
  throw new Error("Your staff access is unavailable. Please sign in again.");
}

export function temporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return "Ja9!" + Array.from(bytes, (n) => "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"[n % 54]).join("");
}
export async function codeDigest(id: string, code: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${id}:${code}`));
  return Array.from(new Uint8Array(bytes), (n) => n.toString(16).padStart(2, "0")).join("");
}
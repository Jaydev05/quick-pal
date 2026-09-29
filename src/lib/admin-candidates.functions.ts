import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminCandidate = {
  id: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  confirmedAt: string | null;
  lastSignInAt: string | null;
  profile: {
    fullName: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    currentJobTitle: string | null;
    experienceYears: number | null;
    education: string | null;
    skills: string[];
    preferredLocation: string | null;
    preferredCategory: string | null;
    expectedSalary: number | null;
    resumePath: string | null;
    resumeName: string | null;
    resumeUploadedAt: string | null;
    updatedAt: string | null;
  };
  applicationCount: number;
  savedJobCount: number;
};

export const getAdminCandidates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminCandidate[]> => {
    const { data: adminRole, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Candidate directory admin check failed", roleError.message);
      throw new Error("Could not verify admin access. Please sign in again.");
    }
    if (!adminRole) throw new Error("Admin access required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const users: Array<{
      id: string;
      email?: string;
      phone?: string;
      created_at: string;
      email_confirmed_at?: string;
      phone_confirmed_at?: string;
      last_sign_in_at?: string;
      user_metadata?: { full_name?: unknown; phone?: unknown };
    }> = [];

    for (let page = 1; page <= 50; page += 1) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error("Could not load registered accounts");
      users.push(...data.users);
      if (data.users.length < 1000) break;
      if (page === 50) throw new Error("Candidate directory is too large to load at once");
    }

    const [profilesResult, rolesResult, applicationsResult, savedJobsResult] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("*, categories(name)"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("applications").select("candidate_id"),
      supabaseAdmin.from("saved_jobs").select("candidate_id"),
    ]);

    if (profilesResult.error) throw new Error("Could not load candidate profiles");
    if (rolesResult.error) throw new Error("Could not load account roles");
    if (applicationsResult.error) throw new Error("Could not load candidate activity");
    if (savedJobsResult.error) throw new Error("Could not load saved-job activity");

    const adminIds = new Set(
      (rolesResult.data ?? []).filter((row) => row.role === "admin").map((row) => row.user_id),
    );
    const profilesById = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
    const applicationCounts = new Map<string, number>();
    const savedJobCounts = new Map<string, number>();
    for (const row of applicationsResult.data ?? []) {
      applicationCounts.set(row.candidate_id, (applicationCounts.get(row.candidate_id) ?? 0) + 1);
    }
    for (const row of savedJobsResult.data ?? []) {
      savedJobCounts.set(row.candidate_id, (savedJobCounts.get(row.candidate_id) ?? 0) + 1);
    }

    return users
      .filter((user) => !adminIds.has(user.id))
      .map((user) => {
        const profile = profilesById.get(user.id);
        const metadataName =
          typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
        const metadataPhone =
          typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null;
        const rawCategory = profile?.categories as unknown;
        const category = Array.isArray(rawCategory)
          ? rawCategory[0] as { name?: string } | undefined
          : rawCategory as { name?: string } | null | undefined;
        const skills = Array.isArray(profile?.skills)
          ? profile.skills.filter((skill): skill is string => typeof skill === "string")
          : [];

        return {
          id: user.id,
          email: profile?.email ?? user.email ?? null,
          phone: profile?.phone ?? user.phone ?? metadataPhone,
          createdAt: user.created_at,
          confirmedAt: user.email_confirmed_at ?? user.phone_confirmed_at ?? null,
          lastSignInAt: user.last_sign_in_at ?? null,
          profile: {
            fullName: profile?.full_name || metadataName || "Profile not completed",
            email: profile?.email ?? user.email ?? null,
            phone: profile?.phone ?? user.phone ?? metadataPhone,
            city: profile?.city ?? null,
            state: profile?.state ?? null,
            country: profile?.country ?? null,
            currentJobTitle: profile?.current_job_title ?? null,
            experienceYears: profile?.experience_years ?? null,
            education: profile?.education ?? null,
            skills,
            preferredLocation: profile?.preferred_location ?? null,
            preferredCategory: category?.name ?? null,
            expectedSalary: profile?.expected_salary ?? null,
            resumePath: profile?.resume_path ?? null,
            resumeName: profile?.resume_name ?? null,
            resumeUploadedAt: profile?.resume_uploaded_at ?? null,
            updatedAt: profile?.updated_at ?? null,
          },
          applicationCount: applicationCounts.get(user.id) ?? 0,
          savedJobCount: savedJobCounts.get(user.id) ?? 0,
        };
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  });
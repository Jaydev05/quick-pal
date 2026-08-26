CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin','recruiter')
  );
$$;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
CREATE POLICY "own roles readable" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (private.has_role(auth.uid(),'admin'))
WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "own profile" ON public.profiles;
CREATE POLICY "own profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid() OR private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "update own profile" ON public.profiles;
CREATE POLICY "update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR private.has_role(auth.uid(),'admin'))
WITH CHECK (id = auth.uid() OR private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "categories public read" ON public.categories;
CREATE POLICY "categories public read" ON public.categories
FOR SELECT TO anon, authenticated
USING (active OR private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "categories admin write" ON public.categories;
CREATE POLICY "categories admin write" ON public.categories
FOR ALL TO authenticated
USING (private.has_role(auth.uid(),'admin'))
WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "jobs public read" ON public.jobs;
CREATE POLICY "jobs public read" ON public.jobs
FOR SELECT TO anon, authenticated
USING ((is_public = true AND status <> 'draft') OR private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "jobs admin write" ON public.jobs;
CREATE POLICY "jobs admin write" ON public.jobs
FOR ALL TO authenticated
USING (private.has_role(auth.uid(),'admin'))
WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "applications read" ON public.applications;
CREATE POLICY "applications read" ON public.applications
FOR SELECT TO authenticated
USING (candidate_id = auth.uid() OR private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "applications update" ON public.applications;
CREATE POLICY "applications update" ON public.applications
FOR UPDATE TO authenticated
USING (candidate_id = auth.uid() OR private.is_staff(auth.uid()))
WITH CHECK (candidate_id = auth.uid() OR private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "applications delete" ON public.applications;
CREATE POLICY "applications delete" ON public.applications
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "history read" ON public.application_status_history;
CREATE POLICY "history read" ON public.application_status_history
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_id
      AND (a.candidate_id = auth.uid() OR private.is_staff(auth.uid()))
  )
);

DROP POLICY IF EXISTS "history insert" ON public.application_status_history;
CREATE POLICY "history insert" ON public.application_status_history
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_id
      AND (a.candidate_id = auth.uid() OR private.is_staff(auth.uid()))
  )
);

DROP POLICY IF EXISTS "insert notifications" ON public.notifications;
CREATE POLICY "insert notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "interviews read" ON public.interviews;
CREATE POLICY "interviews read" ON public.interviews
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_id
      AND (a.candidate_id = auth.uid() OR private.is_staff(auth.uid()))
  )
);

DROP POLICY IF EXISTS "interviews staff write" ON public.interviews;
CREATE POLICY "interviews staff write" ON public.interviews
FOR ALL TO authenticated
USING (private.is_staff(auth.uid()))
WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "payments admin" ON public.payments;
CREATE POLICY "payments admin" ON public.payments
FOR ALL TO authenticated
USING (private.has_role(auth.uid(),'admin'))
WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "staff read enquiries" ON public.service_enquiries;
CREATE POLICY "staff read enquiries" ON public.service_enquiries
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff update enquiries" ON public.service_enquiries;
CREATE POLICY "staff update enquiries" ON public.service_enquiries
FOR UPDATE TO authenticated
USING (private.is_staff(auth.uid()))
WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "admin delete enquiries" ON public.service_enquiries;
CREATE POLICY "admin delete enquiries" ON public.service_enquiries
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "staff read logs" ON public.admin_activity_logs;
CREATE POLICY "staff read logs" ON public.admin_activity_logs
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "staff write logs" ON public.admin_activity_logs;
CREATE POLICY "staff write logs" ON public.admin_activity_logs
FOR INSERT TO authenticated
WITH CHECK (private.is_staff(auth.uid()) AND actor_id = auth.uid());

DROP POLICY IF EXISTS "settings admin write" ON public.site_settings;
CREATE POLICY "settings admin write" ON public.site_settings
FOR ALL TO authenticated
USING (private.has_role(auth.uid(),'admin'))
WITH CHECK (private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "resume own read" ON storage.objects;
CREATE POLICY "resume own read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND ((storage.foldername(name))[1] = auth.uid()::text OR private.is_staff(auth.uid())));

DROP POLICY IF EXISTS "poster admin write" ON storage.objects;
CREATE POLICY "poster admin write" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'job-posters' AND private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "poster admin update" ON storage.objects;
CREATE POLICY "poster admin update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'job-posters' AND private.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "poster admin delete" ON storage.objects;
CREATE POLICY "poster admin delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'job-posters' AND private.has_role(auth.uid(),'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_job_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_application_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
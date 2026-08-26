GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone);

  IF lower(COALESCE(NEW.email, '')) = 'jaydevassociates25@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'candidate')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

INSERT INTO public.profiles (id, full_name, email, phone)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name',''),
  u.email,
  u.raw_user_meta_data->>'phone'
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
  phone = COALESCE(public.profiles.phone, EXCLUDED.phone);

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(COALESCE(u.email, '')) = 'jaydevassociates25@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'candidate'::public.app_role
FROM auth.users u
WHERE lower(COALESCE(u.email, '')) <> 'jaydevassociates25@gmail.com'
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "applications read" ON public.applications;
CREATE POLICY "applications read" ON public.applications
FOR SELECT TO authenticated
USING (candidate_id = auth.uid() OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "applications update" ON public.applications;
CREATE POLICY "applications update" ON public.applications
FOR UPDATE TO authenticated
USING (candidate_id = auth.uid() OR public.is_staff(auth.uid()))
WITH CHECK (candidate_id = auth.uid() OR public.is_staff(auth.uid()));

INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp','917744975512'),
  ('instagram_url','https://www.instagram.com/jaydev.associates?igsi=MWhhcTZ6Y3M5MHkxdA=='),
  ('linkedin_url','https://www.linkedin.com/company/jaydev-associates/')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
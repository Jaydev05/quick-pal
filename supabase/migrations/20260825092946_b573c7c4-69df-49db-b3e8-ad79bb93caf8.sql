-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','recruiter','candidate');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','recruiter'));
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- shared updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  city text, state text, country text DEFAULT 'India',
  current_job_title text,
  experience_years numeric,
  education text,
  skills text[] NOT NULL DEFAULT '{}',
  preferred_location text,
  preferred_category_id uuid,
  expected_salary numeric,
  resume_path text,
  resume_name text,
  resume_uploaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'candidate') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- one-time admin bootstrap: only works while no admin exists
CREATE OR REPLACE FUNCTION public.claim_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(),'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_exists() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (active OR public.is_staff(auth.uid()));
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.profiles ADD CONSTRAINT profiles_pref_cat_fk FOREIGN KEY (preferred_category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- JOBS
CREATE TYPE public.job_status AS ENUM ('draft','published','hiring','interviewing','on_hold','closed','filled','expired');
CREATE TYPE public.employment_type AS ENUM ('full_time','part_time','contract','temporary','internship');

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_code text NOT NULL UNIQUE,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  department text,
  client_name text,
  city text, state text, country text DEFAULT 'India',
  employment_type public.employment_type NOT NULL DEFAULT 'full_time',
  min_experience numeric NOT NULL DEFAULT 0,
  max_experience numeric,
  salary_min numeric, salary_max numeric,
  salary_visible boolean NOT NULL DEFAULT true,
  openings integer NOT NULL DEFAULT 1,
  education text,
  skills text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  responsibilities text,
  qualifications text,
  benefits text,
  additional_info text,
  deadline date,
  status public.job_status NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT false,
  accepting_applications boolean NOT NULL DEFAULT true,
  poster_path text,
  instagram_url text,
  instagram_posted boolean NOT NULL DEFAULT false,
  social_caption text,
  internal_notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX jobs_public_idx ON public.jobs (is_public, status, created_at DESC);
GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs public read" ON public.jobs FOR SELECT TO anon, authenticated
  USING ((is_public = true AND status <> 'draft') OR public.is_staff(auth.uid()));
CREATE POLICY "jobs admin write" ON public.jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER jobs_touch BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE SEQUENCE public.job_code_seq START 10001;
CREATE SEQUENCE public.application_code_seq START 10001;
CREATE SEQUENCE public.enquiry_code_seq START 1001;

CREATE OR REPLACE FUNCTION public.next_job_code() RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'JA-' || nextval('public.job_code_seq')::text;
$$;

-- APPLICATIONS
CREATE TYPE public.application_status AS ENUM (
  'applied','under_review','shortlisted','interview_scheduled','interview_completed',
  'document_verification','offer_released','selected','placed','payment_completed',
  'rejected','withdrawn','on_hold','not_responding');

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code text NOT NULL UNIQUE,
  candidate_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  assigned_recruiter_id uuid,
  current_status public.application_status NOT NULL DEFAULT 'applied',
  cover_note text,
  resume_path text,
  internal_notes text,
  applied_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, job_id)
);
GRANT SELECT, INSERT, UPDATE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications read" ON public.applications FOR SELECT TO authenticated
  USING (candidate_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'recruiter') AND assigned_recruiter_id = auth.uid()));
CREATE POLICY "candidate applies" ON public.applications FOR INSERT TO authenticated WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "applications update" ON public.applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'recruiter') AND assigned_recruiter_id = auth.uid()) OR candidate_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'admin') OR (public.has_role(auth.uid(),'recruiter') AND assigned_recruiter_id = auth.uid()) OR candidate_id = auth.uid());
CREATE POLICY "applications delete" ON public.applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER applications_touch BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  previous_status public.application_status,
  new_status public.application_status NOT NULL,
  changed_by uuid,
  candidate_visible_note text,
  internal_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.application_status_history TO authenticated;
GRANT ALL ON public.application_status_history TO service_role;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history read" ON public.application_status_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND (a.candidate_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "history insert" ON public.application_status_history FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND (a.candidate_id = auth.uid() OR public.is_staff(auth.uid()))));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'general',
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- status change trigger -> history + notification
CREATE OR REPLACE FUNCTION public.on_application_status_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.application_status_history (application_id, previous_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.current_status, auth.uid());
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (NEW.candidate_id, 'Application submitted',
      'Your application ' || NEW.application_code || ' has been submitted successfully.', 'application_submitted', '/dashboard/applications');
  ELSIF NEW.current_status IS DISTINCT FROM OLD.current_status THEN
    INSERT INTO public.application_status_history (application_id, previous_status, new_status, changed_by)
    VALUES (NEW.id, OLD.current_status, NEW.current_status, auth.uid());
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (NEW.candidate_id, 'Application status updated',
      'Application ' || NEW.application_code || ' moved to ' || replace(NEW.current_status::text,'_',' ') || '.', 'status_changed', '/dashboard/applications');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER applications_status_trg AFTER INSERT OR UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.on_application_status_change();

-- SAVED JOBS
CREATE TABLE public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved jobs" ON public.saved_jobs FOR ALL TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

-- INTERVIEWS
CREATE TABLE public.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  interview_date date,
  interview_time time,
  mode text,
  location_or_link text,
  interviewer text,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interviews TO authenticated;
GRANT ALL ON public.interviews TO service_role;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interviews read" ON public.interviews FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND (a.candidate_id = auth.uid() OR public.is_staff(auth.uid()))));
CREATE POLICY "interviews staff write" ON public.interviews FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- PAYMENTS (private, staff only)
CREATE TYPE public.payment_status AS ENUM ('not_applicable','pending','partially_paid','paid','failed','refunded');
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  status public.payment_status NOT NULL DEFAULT 'pending',
  payment_date date,
  payment_method text,
  reference_number text,
  internal_note text,
  candidate_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments admin" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "payments candidate visible" ON public.payments FOR SELECT TO authenticated
  USING (candidate_visible = true AND EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.candidate_id = auth.uid()));

-- SERVICE ENQUIRIES
CREATE TYPE public.enquiry_status AS ENUM ('new','contacted','in_progress','converted','closed');
CREATE TABLE public.service_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_code text NOT NULL UNIQUE DEFAULT ('ENQ-' || nextval('public.enquiry_code_seq')::text),
  name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text NOT NULL,
  service text NOT NULL,
  message text NOT NULL,
  status public.enquiry_status NOT NULL DEFAULT 'new',
  assigned_to uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.service_enquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.service_enquiries TO authenticated;
GRANT ALL ON public.service_enquiries TO service_role;
ALTER TABLE public.service_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can enquire" ON public.service_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "staff read enquiries" ON public.service_enquiries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff update enquiries" ON public.service_enquiries FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "admin delete enquiries" ON public.service_enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER enquiries_touch BEFORE UPDATE ON public.service_enquiries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ADMIN ACTIVITY LOGS
CREATE TABLE public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_activity_logs TO authenticated;
GRANT ALL ON public.admin_activity_logs TO service_role;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read logs" ON public.admin_activity_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff write logs" ON public.admin_activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND actor_id = auth.uid());

-- SITE SETTINGS
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('company_name','Jaydev Associates'),
  ('tagline','Your Growth, Our Commitment'),
  ('phone','+91 7744975512'),
  ('whatsapp','917744975512'),
  ('email','jaydevassociates25@gmail.com'),
  ('address','489, Near SBI Bank, Old Bazar Peth, Goregaon, Mangaon, Raigad, Maharashtra – 402103'),
  ('hours_weekday','Monday – Friday: 9:00 AM – 7:00 PM'),
  ('hours_saturday','Saturday: 9:00 AM – 6:00 PM'),
  ('hours_sunday','Sunday: Closed'),
  ('instagram_url','https://www.instagram.com/jaydev.associates/');

INSERT INTO public.categories (name, slug, description) VALUES
  ('IT','it','Information technology and software roles'),
  ('Healthcare','healthcare','Hospital and healthcare roles'),
  ('Manufacturing','manufacturing','Plant, production and manufacturing roles'),
  ('Security','security','Security personnel and supervision'),
  ('Administration','administration','Office and administrative roles'),
  ('Sales','sales','Sales and business development'),
  ('Engineering','engineering','Engineering and technical roles'),
  ('Finance','finance','Accounts and finance roles'),
  ('HR','hr','Human resources and recruitment'),
  ('Facility Management','facility-management','Housekeeping, canteen and facility roles'),
  ('Other','other','Other opportunities');
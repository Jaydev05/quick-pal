CREATE TABLE public.employee_access (
 user_id uuid PRIMARY KEY, full_name text NOT NULL, designation text NOT NULL, phone text NOT NULL, email text NOT NULL UNIQUE, joining_date date NOT NULL DEFAULT CURRENT_DATE, notes text, active boolean NOT NULL DEFAULT true, must_change_password boolean NOT NULL DEFAULT true, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.employee_access TO authenticated;
GRANT ALL ON public.employee_access TO service_role;
ALTER TABLE public.employee_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee own or main read" ON public.employee_access FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.admin_verified_sessions (session_id uuid PRIMARY KEY, user_id uuid NOT NULL, verified_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL);
GRANT ALL ON public.admin_verified_sessions TO service_role;
ALTER TABLE public.admin_verified_sessions ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.admin_login_challenges (id uuid PRIMARY KEY, user_id uuid NOT NULL, code_digest text NOT NULL, auth_token_hash text NOT NULL, attempts integer NOT NULL DEFAULT 0, expires_at timestamptz NOT NULL, consumed boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.admin_login_challenges TO service_role;
ALTER TABLE public.admin_login_challenges ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=_user_id AND r.role=_role) AND CASE
 WHEN _role='admin' THEN _user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.admin_verified_sessions s WHERE s.user_id=_user_id AND s.session_id::text=auth.jwt()->>'session_id' AND s.expires_at>now())
 WHEN _role='recruiter' THEN EXISTS(SELECT 1 FROM public.employee_access e WHERE e.user_id=_user_id AND e.active AND NOT e.must_change_password)
 ELSE true END;
$$;
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_user_id,_role); $$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(_user_id,'admin') OR public.has_role(_user_id,'recruiter'); $$;
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.is_staff(_user_id); $$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated,anon;
CREATE POLICY "employees post jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK(public.has_role(auth.uid(),'recruiter'));
CREATE POLICY "employees update jobs" ON public.jobs FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'recruiter')) WITH CHECK(public.has_role(auth.uid(),'recruiter'));
CREATE POLICY "employees add job categories" ON public.categories FOR INSERT TO authenticated WITH CHECK(public.has_role(auth.uid(),'recruiter'));
CREATE OR REPLACE FUNCTION public.consume_admin_login_challenge(challenge_id uuid, digest text) RETURNS TABLE(user_id uuid,auth_token_hash text) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.admin_login_challenges;
BEGIN
 SELECT * INTO c FROM public.admin_login_challenges WHERE id=challenge_id FOR UPDATE;
 IF NOT FOUND OR c.consumed OR c.expires_at<=now() OR c.attempts>=5 THEN RETURN; END IF;
 UPDATE public.admin_login_challenges SET attempts=attempts+1 WHERE id=challenge_id;
 IF c.code_digest<>digest THEN RETURN; END IF;
 UPDATE public.admin_login_challenges SET consumed=true WHERE id=challenge_id;
 RETURN QUERY SELECT c.user_id,c.auth_token_hash;
END; $$;
REVOKE ALL ON FUNCTION public.consume_admin_login_challenge(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_admin_login_challenge(uuid,text) TO service_role;
CREATE OR REPLACE FUNCTION public.enforce_single_main_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NEW.role='admin' AND NOT EXISTS(SELECT 1 FROM auth.users WHERE id=NEW.user_id AND lower(email)='jaydevassociates25@gmail.com') THEN RAISE EXCEPTION 'Only the main administrator may hold this role'; END IF;
 RETURN NEW; END; $$;
CREATE TRIGGER single_main_admin BEFORE INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.enforce_single_main_admin();
CREATE TABLE public.desk_candidates (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), full_name text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', phone_key text NOT NULL DEFAULT '', email_key text NOT NULL DEFAULT '', education text NOT NULL DEFAULT '', specialization text NOT NULL DEFAULT '', college text NOT NULL DEFAULT '', skills text NOT NULL DEFAULT '', experience_years numeric, designation text NOT NULL DEFAULT '', company text NOT NULL DEFAULT '', location text NOT NULL DEFAULT '', preferred_location text NOT NULL DEFAULT '', summary text NOT NULL DEFAULT '', keywords text NOT NULL DEFAULT '', extracted_text text NOT NULL DEFAULT '', resume_path text NOT NULL DEFAULT '', resume_name text NOT NULL DEFAULT '', file_hash text NOT NULL DEFAULT '', processing_status text NOT NULL DEFAULT 'Manual entry', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', full_name || ' ' || email || ' ' || phone || ' ' || education || ' ' || specialization || ' ' || skills || ' ' || designation || ' ' || company || ' ' || location || ' ' || keywords || ' ' || extracted_text)) STORED
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.desk_candidates TO authenticated;
GRANT ALL ON public.desk_candidates TO service_role;
ALTER TABLE public.desk_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY desk_candidates_main_only ON public.desk_candidates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX desk_email_identity ON public.desk_candidates(email_key) WHERE email_key <> '';
CREATE UNIQUE INDEX desk_phone_identity ON public.desk_candidates(phone_key) WHERE phone_key <> '';
CREATE UNIQUE INDEX desk_file_identity ON public.desk_candidates(file_hash) WHERE file_hash <> '';
CREATE INDEX desk_resume_search ON public.desk_candidates USING gin(search_vector);
CREATE TRIGGER desk_candidates_touch BEFORE UPDATE ON public.desk_candidates FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TABLE public.desk_calls (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), candidate_id uuid NOT NULL REFERENCES public.desk_candidates(id) ON DELETE CASCADE, subject text NOT NULL, company text NOT NULL DEFAULT '', called_at timestamptz NOT NULL, outcome text NOT NULL, interest text NOT NULL, discussion text NOT NULL DEFAULT '', expectations text NOT NULL DEFAULT '', remarks text NOT NULL DEFAULT '', followup_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.desk_calls TO authenticated;
GRANT ALL ON public.desk_calls TO service_role;
ALTER TABLE public.desk_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY desk_calls_main_only ON public.desk_calls FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX desk_calls_candidate ON public.desk_calls(candidate_id,called_at DESC);
CREATE TABLE public.desk_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL, title text NOT NULL, description text NOT NULL DEFAULT '', notes text NOT NULL DEFAULT '', priority text NOT NULL DEFAULT 'Medium', status text NOT NULL DEFAULT 'Pending', scheduled_at timestamptz, deadline timestamptz, reminder_at timestamptz, candidate_id uuid REFERENCES public.desk_candidates(id) ON DELETE CASCADE, call_id uuid REFERENCES public.desk_calls(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT desk_item_kind CHECK(kind IN ('task','followup','meeting','reminder')), CONSTRAINT desk_item_priority CHECK(priority IN ('Low','Medium','High','Urgent')), CONSTRAINT desk_item_status CHECK(status IN ('Pending','In Progress','Completed')), UNIQUE(call_id)
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.desk_items TO authenticated;
GRANT ALL ON public.desk_items TO service_role;
ALTER TABLE public.desk_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY desk_items_main_only ON public.desk_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX desk_due_items ON public.desk_items(scheduled_at,status);
CREATE TRIGGER desk_items_touch BEFORE UPDATE ON public.desk_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE FUNCTION public.desk_call_followup() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN IF NEW.followup_at IS NOT NULL THEN INSERT INTO public.desk_items(kind,title,scheduled_at,candidate_id,call_id,notes) VALUES ('followup',NEW.subject,NEW.followup_at,NEW.candidate_id,NEW.id,NEW.discussion); END IF; RETURN NEW; END $$;
CREATE TRIGGER desk_call_followup AFTER INSERT ON public.desk_calls FOR EACH ROW EXECUTE FUNCTION public.desk_call_followup();
CREATE TABLE public.desk_activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entity_id uuid, entity_type text NOT NULL, action text NOT NULL, label text NOT NULL DEFAULT '', actor_id uuid NOT NULL DEFAULT auth.uid(), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT ON public.desk_activity TO authenticated;
GRANT ALL ON public.desk_activity TO service_role;
ALTER TABLE public.desk_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY desk_activity_read ON public.desk_activity FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE POLICY desk_activity_insert ON public.desk_activity FOR INSERT TO authenticated WITH CHECK(public.has_role(auth.uid(),'admin') AND actor_id=auth.uid());
CREATE FUNCTION public.desk_audit() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE rowdata jsonb; BEGIN rowdata=CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END; INSERT INTO public.desk_activity(entity_id,entity_type,action,label) VALUES ((rowdata->>'id')::uuid,TG_TABLE_NAME,lower(TG_OP),coalesce(rowdata->>'title',rowdata->>'full_name',rowdata->>'subject','')); RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END; END $$;
CREATE TRIGGER desk_candidates_audit AFTER INSERT OR UPDATE OR DELETE ON public.desk_candidates FOR EACH ROW EXECUTE FUNCTION public.desk_audit();
CREATE TRIGGER desk_calls_audit AFTER INSERT OR UPDATE OR DELETE ON public.desk_calls FOR EACH ROW EXECUTE FUNCTION public.desk_audit();
CREATE TRIGGER desk_items_audit AFTER INSERT OR UPDATE OR DELETE ON public.desk_items FOR EACH ROW EXECUTE FUNCTION public.desk_audit();
CREATE POLICY desk_resume_main_only ON storage.objects FOR ALL TO authenticated USING(bucket_id='desk-resumes' AND public.has_role(auth.uid(),'admin')) WITH CHECK(bucket_id='desk-resumes' AND public.has_role(auth.uid(),'admin') AND (storage.foldername(name))[1]=auth.uid()::text);
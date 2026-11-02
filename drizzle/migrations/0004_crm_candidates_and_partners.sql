CREATE TABLE public.crm_companies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, contact_name text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', address text NOT NULL DEFAULT '', industry text NOT NULL DEFAULT '', commission_percent numeric, commission_basis text NOT NULL DEFAULT '', terms text NOT NULL DEFAULT '', vacancies text NOT NULL DEFAULT '', notes text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT crm_commission_range CHECK (commission_percent IS NULL OR commission_percent BETWEEN 0 AND 100)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_companies TO authenticated;
GRANT ALL ON public.crm_companies TO service_role;
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY crm_companies_main_only ON public.crm_companies FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TRIGGER crm_companies_touch BEFORE UPDATE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER crm_companies_audit AFTER INSERT OR UPDATE OR DELETE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.desk_audit();
ALTER TABLE public.desk_candidates ADD COLUMN recruitment_status text NOT NULL DEFAULT 'Looking for job', ADD COLUMN source text NOT NULL DEFAULT '', ADD COLUMN desired_job text NOT NULL DEFAULT '', ADD COLUMN arrived_on date, ADD COLUMN interview_on date, ADD COLUMN placed_on date, ADD COLUMN placement_company text NOT NULL DEFAULT '', ADD COLUMN partner_id uuid REFERENCES public.crm_companies(id), ADD COLUMN salary_package text NOT NULL DEFAULT '', ADD COLUMN offer_path text NOT NULL DEFAULT '', ADD COLUMN offer_name text NOT NULL DEFAULT '', ADD COLUMN notes text NOT NULL DEFAULT '';
ALTER TABLE public.desk_candidates ADD CONSTRAINT crm_candidate_status CHECK(recruitment_status IN ('Looking for job','In process','Placed','Not placed'));
CREATE INDEX crm_candidate_status_index ON public.desk_candidates(recruitment_status);
COMMENT ON TABLE public.desk_candidates IS 'Private CRM candidate and resume bank; retained name preserves existing records and deployed compatibility.';
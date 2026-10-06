ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_summary text;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_summary_length CHECK (professional_summary IS NULL OR char_length(professional_summary) <= 3000);
CREATE TABLE public.resume_analysis_service_state (
 feature text PRIMARY KEY,
 paused boolean NOT NULL DEFAULT false,
 status_code integer,
 message text,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.resume_analysis_service_state TO service_role;
ALTER TABLE public.resume_analysis_service_state ENABLE ROW LEVEL SECURITY;
INSERT INTO public.resume_analysis_service_state(feature) VALUES ('resume_profile') ON CONFLICT DO NOTHING;
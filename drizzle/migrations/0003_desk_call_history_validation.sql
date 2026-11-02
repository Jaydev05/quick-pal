REVOKE UPDATE ON public.desk_calls FROM authenticated;
ALTER TABLE public.desk_calls ADD CONSTRAINT desk_call_outcome CHECK(outcome IN ('Connected','Not Answered','Busy','Switched Off','Call Back'));
ALTER TABLE public.desk_calls ADD CONSTRAINT desk_call_interest CHECK(interest IN ('Interested','Not Interested','Maybe'));
ALTER TABLE public.desk_candidates ADD CONSTRAINT desk_candidate_processing CHECK(processing_status IN ('Ready','Needs review','Manual entry'));
ALTER TABLE public.desk_candidates ADD CONSTRAINT desk_candidate_experience CHECK(experience_years IS NULL OR (experience_years >= 0 AND experience_years <= 60));
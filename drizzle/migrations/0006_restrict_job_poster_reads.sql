DROP POLICY IF EXISTS "poster public read" ON storage.objects;
CREATE POLICY "poster public read" ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'job-posters' AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.poster_path = storage.objects.name AND j.is_public
      AND j.status IN ('published','hiring','interviewing')
  )
);
CREATE POLICY "poster staff read" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'job-posters' AND (private.has_role(auth.uid(),'admin'::app_role) OR private.has_role(auth.uid(),'recruiter'::app_role))
);
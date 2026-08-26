CREATE POLICY "resume own read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid())));
CREATE POLICY "resume own insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "resume own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "resume own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "poster public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'job-posters');
CREATE POLICY "poster admin write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'job-posters' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "poster admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'job-posters' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "poster admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'job-posters' AND public.has_role(auth.uid(),'admin'));
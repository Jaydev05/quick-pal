DROP POLICY IF EXISTS "settings public read" ON public.site_settings;
DROP POLICY IF EXISTS "anyone can enquire" ON public.service_enquiries;
CREATE POLICY "anyone can enquire" ON public.service_enquiries
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new'::enquiry_status
  AND assigned_to IS NULL
  AND notes IS NULL
  AND char_length(btrim(name)) BETWEEN 1 AND 200
  AND char_length(btrim(email)) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(btrim(phone)) BETWEEN 5 AND 30
  AND char_length(btrim(service)) BETWEEN 1 AND 200
  AND char_length(btrim(message)) BETWEEN 1 AND 5000
  AND (company IS NULL OR char_length(company) <= 200)
);
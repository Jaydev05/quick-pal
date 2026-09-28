CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status_history_id uuid REFERENCES public.application_status_history(id) ON DELETE CASCADE,
  email text NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('application_confirmation', 'status_change')),
  previous_status public.application_status,
  new_status public.application_status,
  sent_at timestamptz,
  delivery_status text NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.notification_logs TO authenticated;
GRANT ALL ON public.notification_logs TO service_role;

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notification logs"
ON public.notification_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE UNIQUE INDEX notification_logs_confirmation_once
ON public.notification_logs (application_id, notification_type)
WHERE notification_type = 'application_confirmation';

CREATE UNIQUE INDEX notification_logs_status_event_once
ON public.notification_logs (status_history_id, notification_type)
WHERE notification_type = 'status_change' AND status_history_id IS NOT NULL;

CREATE INDEX notification_logs_application_created_idx
ON public.notification_logs (application_id, created_at DESC);
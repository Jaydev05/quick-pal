ALTER POLICY "staff read logs" ON public.admin_activity_logs USING(private.has_role(auth.uid(),'admin'));
ALTER POLICY "staff write logs" ON public.admin_activity_logs WITH CHECK(private.has_role(auth.uid(),'admin') AND actor_id=auth.uid());
CREATE INDEX admin_challenge_user_created ON public.admin_login_challenges(user_id,created_at DESC);
CREATE INDEX verified_sessions_user ON public.admin_verified_sessions(user_id);
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC,anon,authenticated;
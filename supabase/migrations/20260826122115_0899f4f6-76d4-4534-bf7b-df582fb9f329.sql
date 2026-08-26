REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.next_job_code() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.next_job_code() FROM anon;
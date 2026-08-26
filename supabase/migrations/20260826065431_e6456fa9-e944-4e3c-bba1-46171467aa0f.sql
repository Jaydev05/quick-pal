REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_exists() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM authenticated;
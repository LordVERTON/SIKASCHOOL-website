-- These SECURITY DEFINER functions only run as auth.users triggers; browser
-- roles must not be able to call them through the public RPC API.
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_auth_user_to_profile() FROM PUBLIC, anon, authenticated;

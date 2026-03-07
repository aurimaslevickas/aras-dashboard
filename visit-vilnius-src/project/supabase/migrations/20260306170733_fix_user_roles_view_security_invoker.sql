/*
  # Fix user_roles view - remove SECURITY DEFINER

  ## Summary
  The `user_roles` view was defined with SECURITY DEFINER, which means it runs
  with the privileges of the view owner (typically a superuser), bypassing RLS
  policies on the underlying `users` table. This is a security risk.

  ## Fix
  Recreate the view with SECURITY INVOKER (the default) so that it respects
  the RLS policies of the calling user.
*/

DROP VIEW IF EXISTS public.user_roles;

CREATE VIEW public.user_roles
  WITH (security_invoker = true)
AS
  SELECT id, role FROM public.users;

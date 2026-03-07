/*
  # Fix audit_log INSERT policy

  The existing "Authenticated users can insert audit log" policy has
  WITH CHECK (true) which is always true and bypasses RLS intent.
  Replace it with a policy that ensures users can only insert audit
  log entries attributed to themselves.
*/

DROP POLICY IF EXISTS "Authenticated users can insert audit log" ON public.audit_log;

CREATE POLICY "Authenticated users can insert audit log"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

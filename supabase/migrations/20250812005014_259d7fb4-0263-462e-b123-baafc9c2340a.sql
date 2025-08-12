-- Phase 1 (Security & Audit) - Minimal viable audit logging to support Security page
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text NULL,
  old_values jsonb NULL,
  new_values jsonb NULL,
  severity text NOT NULL DEFAULT 'info'
);

-- Enable RLS and policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow viewing logs only for current user's org
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Users can view audit logs for their org'
  ) THEN
    CREATE POLICY "Users can view audit logs for their org"
    ON public.audit_logs
    FOR SELECT
    USING (org_id = public.get_current_user_org_id());
  END IF;
END $$;

-- Allow inserting audit rows when operating within the same org
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Allow insert audit logs for current org'
  ) THEN
    CREATE POLICY "Allow insert audit logs for current org"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (org_id = public.get_current_user_org_id());
  END IF;
END $$;

-- No UPDATE/DELETE from client

-- Generic trigger function to log INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION public.trg_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_action text;
  v_org uuid;
  v_record_id text;
  v_old jsonb;
  v_new jsonb;
BEGIN
  v_action := lower(TG_OP);
  v_org := COALESCE(NEW.org_id, OLD.org_id);
  v_record_id := COALESCE(
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN (NEW.id)::text END,
    CASE WHEN TG_OP = 'DELETE' THEN (OLD.id)::text END
  );
  v_old := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  v_new := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END;

  -- Only log rows tied to an organization
  IF v_org IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.audit_logs (org_id, user_id, action, table_name, record_id, old_values, new_values, severity)
  VALUES (v_org, auth.uid(), v_action, TG_TABLE_NAME, v_record_id, v_old, v_new, 'info');

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach audit trigger to key business tables
DO $$ BEGIN
  -- guests
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_guests_changes'
  ) THEN
    CREATE TRIGGER audit_guests_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.guests
    FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();
  END IF;

  -- reservations
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_reservations_changes'
  ) THEN
    CREATE TRIGGER audit_reservations_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();
  END IF;

  -- invoices (if table exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='invoices'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_invoices_changes'
  ) THEN
    CREATE TRIGGER audit_invoices_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();
  END IF;

  -- payment_transactions
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='payment_transactions'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_payment_transactions_changes'
  ) THEN
    CREATE TRIGGER audit_payment_transactions_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.payment_transactions
    FOR EACH ROW EXECUTE FUNCTION public.trg_audit_log();
  END IF;
END $$;
-- Retry migration with safe ordering and text overload for has_role to avoid enum literal usage during creation

-- 0) Create a text overload for has_role to avoid unsafe enum literal usage in policies
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = (_role)::public.app_role
  );
$$;

-- 1) Extend app_role enum safely (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'super_admin'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'super_admin';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'manager'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'manager';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'receptionist'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'receptionist';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'accountant'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'accountant';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'housekeeping'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'housekeeping';
  END IF;
END
$$;

-- 2) Enrich app_users with optional contact fields (idempotent)
ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- 3) User security settings table + RLS
CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  two_factor_method text CHECK (two_factor_method IN ('totp','email','sms')),
  read_only_until timestamptz,
  last_password_reset_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

-- Policies using text overload (no enum literal at creation time)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_security_settings' AND policyname='Users can view own security settings'
  ) THEN
    CREATE POLICY "Users can view own security settings"
      ON public.user_security_settings FOR SELECT
      USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_security_settings' AND policyname='Users can update own security settings'
  ) THEN
    CREATE POLICY "Users can update own security settings"
      ON public.user_security_settings FOR UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='user_security_settings' AND policyname='Super admins manage user security settings'
  ) THEN
    CREATE POLICY "Super admins manage user security settings"
      ON public.user_security_settings FOR ALL
      USING (public.has_role(auth.uid(),'super_admin'))
      WITH CHECK (public.has_role(auth.uid(),'super_admin'));
  END IF;
END
$$;

-- Reuse generic updated_at trigger
DROP TRIGGER IF EXISTS tg_user_security_settings_updated_at ON public.user_security_settings;
CREATE TRIGGER tg_user_security_settings_updated_at
BEFORE UPDATE ON public.user_security_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function: is user in temporary read-only mode?
CREATE OR REPLACE FUNCTION public.is_user_read_only(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT read_only_until > now()
     FROM public.user_security_settings
     WHERE user_id = _user_id),
    false
  );
$$;

-- 4) Read-only enforcement trigger
CREATE OR REPLACE FUNCTION public.enforce_read_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_user_read_only(auth.uid()) THEN
    RAISE EXCEPTION 'Votre compte est en mode lecture seule jusqu''au %', 
      (SELECT read_only_until FROM public.user_security_settings WHERE user_id = auth.uid())
      USING ERRCODE = '0L000';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach to critical tables
DROP TRIGGER IF EXISTS tg_ro_guests_ins ON public.guests;
DROP TRIGGER IF EXISTS tg_ro_guests_upd ON public.guests;
DROP TRIGGER IF EXISTS tg_ro_guests_del ON public.guests;
CREATE TRIGGER tg_ro_guests_ins BEFORE INSERT ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();
CREATE TRIGGER tg_ro_guests_upd BEFORE UPDATE ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();
CREATE TRIGGER tg_ro_guests_del BEFORE DELETE ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();

DROP TRIGGER IF EXISTS tg_ro_reservations_ins ON public.reservations;
DROP TRIGGER IF EXISTS tg_ro_reservations_upd ON public.reservations;
DROP TRIGGER IF EXISTS tg_ro_reservations_del ON public.reservations;
CREATE TRIGGER tg_ro_reservations_ins BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();
CREATE TRIGGER tg_ro_reservations_upd BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();
CREATE TRIGGER tg_ro_reservations_del BEFORE DELETE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();

DROP TRIGGER IF EXISTS tg_ro_invoices_ins ON public.invoices;
DROP TRIGGER IF EXISTS tg_ro_invoices_upd ON public.invoices;
DROP TRIGGER IF EXISTS tg_ro_invoices_del ON public.invoices;
CREATE TRIGGER tg_ro_invoices_ins BEFORE INSERT ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();
CREATE TRIGGER tg_ro_invoices_upd BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();
CREATE TRIGGER tg_ro_invoices_del BEFORE DELETE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();

DROP TRIGGER IF EXISTS tg_ro_payments_ins ON public.payment_transactions;
DROP TRIGGER IF EXISTS tg_ro_payments_upd ON public.payment_transactions;
DROP TRIGGER IF EXISTS tg_ro_payments_del ON public.payment_transactions;
CREATE TRIGGER tg_ro_payments_ins BEFORE INSERT ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();
CREATE TRIGGER tg_ro_payments_upd BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();
CREATE TRIGGER tg_ro_payments_del BEFORE DELETE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_read_only();

-- 5) Audit infrastructure
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  org_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  severity text NOT NULL DEFAULT 'info'
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='audit_logs' AND policyname='Users can view audit logs for their org'
  ) THEN
    CREATE POLICY "Users can view audit logs for their org"
      ON public.audit_logs FOR SELECT
      USING (org_id = get_current_user_org_id());
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.audit_row_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_org_id uuid;
  v_record_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    v_org_id := COALESCE(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_org_id := COALESCE(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_org_id := COALESCE(OLD.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(OLD)->>'id')::uuid;
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tg_audit_guests ON public.guests;
CREATE TRIGGER tg_audit_guests
AFTER INSERT OR UPDATE OR DELETE ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.audit_row_changes();

DROP TRIGGER IF EXISTS tg_audit_reservations ON public.reservations;
CREATE TRIGGER tg_audit_reservations
AFTER INSERT OR UPDATE OR DELETE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.audit_row_changes();

DROP TRIGGER IF EXISTS tg_audit_invoices ON public.invoices;
CREATE TRIGGER tg_audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.audit_row_changes();

DROP TRIGGER IF EXISTS tg_audit_payments ON public.payment_transactions;
CREATE TRIGGER tg_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.audit_row_changes();

DROP TRIGGER IF EXISTS tg_audit_app_users ON public.app_users;
CREATE TRIGGER tg_audit_app_users
AFTER INSERT OR UPDATE OR DELETE ON public.app_users
FOR EACH ROW EXECUTE FUNCTION public.audit_row_changes();

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_time ON public.audit_logs(org_id, occurred_at DESC);

-- 6) Granular permission function
CREATE OR REPLACE FUNCTION public.has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
  v_role public.app_role;
BEGIN
  IF public.has_role(auth.uid(), 'super_admin') THEN
    RETURN true;
  END IF;

  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_role = 'manager' THEN
    RETURN true;
  END IF;

  SELECT profile_id INTO v_profile_id
  FROM public.app_users
  WHERE user_id = auth.uid()
    AND active = true
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profile_permissions pp
    WHERE pp.profile_id = v_profile_id
      AND pp.permission_key = p_permission
      AND pp.allowed = true
  );
END;
$$;

CREATE INDEX IF NOT EXISTS idx_profile_permissions_profile_key
  ON public.profile_permissions(profile_id, permission_key);

-- 7) Seed permissions
INSERT INTO public.permissions(key, label, category)
SELECT 'users.view', 'Voir les utilisateurs', 'system'
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE key = 'users.view');

INSERT INTO public.permissions(key, label, category)
SELECT 'users.manage', 'Gérer les utilisateurs', 'system'
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE key = 'users.manage');

INSERT INTO public.permissions(key, label, category)
SELECT 'permissions.manage', 'Gérer les permissions', 'system'
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE key = 'permissions.manage');

INSERT INTO public.permissions(key, label, category)
SELECT 'security.mfa', 'Configurer 2FA / MFA', 'system'
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE key = 'security.mfa');

INSERT INTO public.permissions(key, label, category)
SELECT 'audit.view', 'Voir le journal d’audit', 'reports'
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE key = 'audit.view');

INSERT INTO public.permissions(key, label, category)
SELECT 'audit.export', 'Exporter le journal d’audit', 'reports'
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE key = 'audit.export');

INSERT INTO public.permissions(key, label, category)
SELECT 'sessions.force_logout', 'Déconnexion forcée de sessions', 'security'
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE key = 'sessions.force_logout');

INSERT INTO public.permissions(key, label, category)
SELECT 'roles.assign', 'Assigner des rôles', 'system'
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE key = 'roles.assign');

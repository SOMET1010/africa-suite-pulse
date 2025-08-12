
-- 1) Etendre les rôles applicatifs (sécurisé si déjà existants)
do $$
begin
  if not exists (
    select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'super_admin'
  ) then
    alter type public.app_role add value 'super_admin';
  end if;

  if not exists (
    select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'manager'
  ) then
    alter type public.app_role add value 'manager';
  end if;

  if not exists (
    select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'receptionist'
  ) then
    alter type public.app_role add value 'receptionist';
  end if;

  if not exists (
    select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'accountant'
  ) then
    alter type public.app_role add value 'accountant';
  end if;

  if not exists (
    select 1 from pg_type t join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'housekeeping'
  ) then
    alter type public.app_role add value 'housekeeping';
  end if;
end
$$;

-- 2) Colonnes additionnelles pour enrichir les comptes
alter table public.app_users
  add column if not exists phone text,
  add column if not exists avatar_url text;

-- 3) Paramètres de sécurité utilisateur (2FA, lecture seule, etc.)
create table if not exists public.user_security_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  two_factor_enabled boolean not null default false,
  two_factor_method text check (two_factor_method in ('totp','email','sms')),
  read_only_until timestamptz,
  last_password_reset_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_security_settings enable row level security;

create policy "Users can view own security settings"
  on public.user_security_settings for select
  using (user_id = auth.uid());

create policy "Users can update own security settings"
  on public.user_security_settings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Super admins manage user security settings"
  on public.user_security_settings for all
  using (public.has_role(auth.uid(),'super_admin'))
  with check (public.has_role(auth.uid(),'super_admin'));

-- Reuse generic updated_at trigger
drop trigger if exists tg_user_security_settings_updated_at on public.user_security_settings;
create trigger tg_user_security_settings_updated_at
before update on public.user_security_settings
for each row execute function public.update_updated_at_column();

-- Helper to know if user is in read-only mode
create or replace function public.is_user_read_only(_user_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(
    (select read_only_until > now()
     from public.user_security_settings
     where user_id = _user_id),
    false
  );
$$;

-- 4) Blocage global lecture seule (enforcement DB)
create or replace function public.enforce_read_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_user_read_only(auth.uid()) then
    raise exception 'Votre compte est en mode lecture seule jusqu''au %', 
      (select read_only_until from public.user_security_settings where user_id = auth.uid())
      using errcode = '0L000'; -- insufficient_privilege
  end if;
  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

-- Attacher aux tables critiques (Insert/Update/Delete)
-- Guests
drop trigger if exists tg_ro_guests_ins on public.guests;
drop trigger if exists tg_ro_guests_upd on public.guests;
drop trigger if exists tg_ro_guests_del on public.guests;
create trigger tg_ro_guests_ins before insert on public.guests
for each row execute function public.enforce_read_only();
create trigger tg_ro_guests_upd before update on public.guests
for each row execute function public.enforce_read_only();
create trigger tg_ro_guests_del before delete on public.guests
for each row execute function public.enforce_read_only();

-- Reservations
drop trigger if exists tg_ro_reservations_ins on public.reservations;
drop trigger if exists tg_ro_reservations_upd on public.reservations;
drop trigger if exists tg_ro_reservations_del on public.reservations;
create trigger tg_ro_reservations_ins before insert on public.reservations
for each row execute function public.enforce_read_only();
create trigger tg_ro_reservations_upd before update on public.reservations
for each row execute function public.enforce_read_only();
create trigger tg_ro_reservations_del before delete on public.reservations
for each row execute function public.enforce_read_only();

-- Invoices
drop trigger if exists tg_ro_invoices_ins on public.invoices;
drop trigger if exists tg_ro_invoices_upd on public.invoices;
drop trigger if exists tg_ro_invoices_del on public.invoices;
create trigger tg_ro_invoices_ins before insert on public.invoices
for each row execute function public.enforce_read_only();
create trigger tg_ro_invoices_upd before update on public.invoices
for each row execute function public.enforce_read_only();
create trigger tg_ro_invoices_del before delete on public.invoices
for each row execute function public.enforce_read_only();

-- Payment Transactions
drop trigger if exists tg_ro_payments_ins on public.payment_transactions;
drop trigger if exists tg_ro_payments_upd on public.payment_transactions;
drop trigger if exists tg_ro_payments_del on public.payment_transactions;
create trigger tg_ro_payments_ins before insert on public.payment_transactions
for each row execute function public.enforce_read_only();
create trigger tg_ro_payments_upd before update on public.payment_transactions
for each row execute function public.enforce_read_only();
create trigger tg_ro_payments_del before delete on public.payment_transactions
for each row execute function public.enforce_read_only();

-- 5) Journalisation/Audit des opérations
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  user_id uuid,
  org_id uuid,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  severity text not null default 'info'
);

alter table public.audit_logs enable row level security;

create policy "Users can view audit logs for their org"
  on public.audit_logs for select
  using (org_id = get_current_user_org_id());

create or replace function public.audit_row_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_org_id uuid;
  v_record_id uuid;
begin
  if TG_OP = 'INSERT' then
    v_action := 'insert';
    v_org_id := coalesce(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    insert into public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    values (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, null, to_jsonb(NEW));
    return NEW;
  elsif TG_OP = 'UPDATE' then
    v_action := 'update';
    v_org_id := coalesce(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    insert into public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    values (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, to_jsonb(OLD), to_jsonb(NEW));
    return NEW;
  elsif TG_OP = 'DELETE' then
    v_action := 'delete';
    v_org_id := coalesce(OLD.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(OLD)->>'id')::uuid;
    insert into public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    values (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, to_jsonb(OLD), null);
    return OLD;
  end if;
  return null;
end;
$$;

-- Attacher l'audit aux tables principales
drop trigger if exists tg_audit_guests on public.guests;
create trigger tg_audit_guests
after insert or update or delete on public.guests
for each row execute function public.audit_row_changes();

drop trigger if exists tg_audit_reservations on public.reservations;
create trigger tg_audit_reservations
after insert or update or delete on public.reservations
for each row execute function public.audit_row_changes();

drop trigger if exists tg_audit_invoices on public.invoices;
create trigger tg_audit_invoices
after insert or update or delete on public.invoices
for each row execute function public.audit_row_changes();

drop trigger if exists tg_audit_payments on public.payment_transactions;
create trigger tg_audit_payments
after insert or update or delete on public.payment_transactions
for each row execute function public.audit_row_changes();

drop trigger if exists tg_audit_app_users on public.app_users;
create trigger tg_audit_app_users
after insert or update or delete on public.app_users
for each row execute function public.audit_row_changes();

create index if not exists idx_audit_logs_org_time on public.audit_logs(org_id, occurred_at desc);

-- 6) has_permission: granularité par profil + rôles
create or replace function public.has_permission(p_permission text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_role public.app_role;
begin
  -- Super admin: accès total
  if public.has_role(auth.uid(), 'super_admin') then
    return true;
  end if;

  -- Manager: accès large (compat ascendant)
  select role into v_role
  from public.user_roles
  where user_id = auth.uid()
  limit 1;

  if v_role = 'manager' then
    return true;
  end if;

  -- Sinon: via permissions du profil affecté
  select profile_id into v_profile_id
  from public.app_users
  where user_id = auth.uid()
    and active = true
  limit 1;

  if v_profile_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.profile_permissions pp
    where pp.profile_id = v_profile_id
      and pp.permission_key = p_permission
      and pp.allowed = true
  );
end;
$$;

create index if not exists idx_profile_permissions_profile_key
  on public.profile_permissions(profile_id, permission_key);

-- 7) Semences de permissions (insert si manquantes)
-- Utilise INSERT ... SELECT ... WHERE NOT EXISTS pour éviter besoin d'unicité sur key
insert into public.permissions(key, label, category)
select 'users.view', 'Voir les utilisateurs', 'system'
where not exists (select 1 from public.permissions where key = 'users.view');

insert into public.permissions(key, label, category)
select 'users.manage', 'Gérer les utilisateurs', 'system'
where not exists (select 1 from public.permissions where key = 'users.manage');

insert into public.permissions(key, label, category)
select 'permissions.manage', 'Gérer les permissions', 'system'
where not exists (select 1 from public.permissions where key = 'permissions.manage');

insert into public.permissions(key, label, category)
select 'security.mfa', 'Configurer 2FA / MFA', 'system'
where not exists (select 1 from public.permissions where key = 'security.mfa');

insert into public.permissions(key, label, category)
select 'audit.view', 'Voir le journal d’audit', 'reports'
where not exists (select 1 from public.permissions where key = 'audit.view');

insert into public.permissions(key, label, category)
select 'audit.export', 'Exporter le journal d’audit', 'reports'
where not exists (select 1 from public.permissions where key = 'audit.export');

insert into public.permissions(key, label, category)
select 'sessions.force_logout', 'Déconnexion forcée de sessions', 'security'
where not exists (select 1 from public.permissions where key = 'sessions.force_logout');

insert into public.permissions(key, label, category)
select 'roles.assign', 'Assigner des rôles', 'system'
where not exists (select 1 from public.permissions where key = 'roles.assign');

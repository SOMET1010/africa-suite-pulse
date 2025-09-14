-- ============================
-- PHASE 1 • PAYMENTS (CI Ready)
-- ============================

-- 1) Méthodes génériques
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  code text not null,                -- ex: CASH, CARD_VISA, MM_OM, MM_WAVE, DEBTOR, DEPOSIT, PAYTELL, CHECK, BANK
  label text not null,               -- "Espèces", "VISA", "Orange Money", ...
  kind text not null check (kind in (
    'cash','card','bank','cheque','mobile','debtor','deposit','paytell','disbursement','other'
  )),
  capture_mode text not null default 'passive' check (capture_mode in ('active','passive')),
  commission_percent numeric(6,3) default 0,
  settlement_delay_days int default 0,
  active boolean default true,
  metadata jsonb default '{}'::jsonb,  -- flex: ex { "scheme":"VISA" } ou { "requires_reference": true }
  expense_service_code text,          -- lien vers prestation Débours si applicable
  created_at timestamptz default now(),
  unique (org_id, code)
);

-- 2) Terminaux cartes (si actifs)
create table if not exists public.payment_terminals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  name text not null,
  provider text,        -- Ingenico, Verifone, Stripe Terminal
  device_id text,
  take_commission boolean default true,
  active boolean default true,
  created_at timestamptz default now()
);

-- 3) Comptes Mobile Money (multi-fournisseurs)
create table if not exists public.mobile_money_accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  provider text not null check (provider in ('OrangeMoney','MTN','Moov','Wave','Other')),
  display_name text not null,             -- "OM Réception", "Wave Bar"
  wallet_msisdn text not null,            -- numéro marchand
  merchant_id text,                        -- identifiant marchand si applicable
  api_provider text,                       -- "CinetPay", "PayDunya", "ProviderLocal", ...
  settlement_account text,                 -- IBAN/compte bancaire de règlement
  default_method_id uuid references public.payment_methods(id) on delete set null,
  active boolean default true,
  created_at timestamptz default now()
);

-- 4) Devises (base + secondaires)
create table if not exists public.currencies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  code char(3) not null,         -- XOF, EUR, USD
  label text not null,
  rate_to_base numeric(14,6) default 1,
  is_base boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  unique (org_id, code)
);

-- 5) RLS (par org)
alter table public.payment_methods enable row level security;
alter table public.payment_terminals enable row level security;
alter table public.mobile_money_accounts enable row level security;
alter table public.currencies enable row level security;

-- Fonction pour récupérer l'org_id via JWT ou fallback
create or replace function public.current_org_id() returns text language sql stable as
$$ select coalesce( nullif( current_setting('request.jwt.claims', true), '' )::json->>'org_id', '' ) $$;

-- Policies simplifiées pour authenticated users
create policy pm_read on public.payment_methods
  for select using (auth.role() = 'authenticated');
create policy pm_write on public.payment_methods
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy tpe_rw on public.payment_terminals
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy mm_rw on public.mobile_money_accounts
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy cur_rw on public.currencies
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 6) Seed data Côte d'Ivoire
-- Get first available org_id
do $$
declare
  target_org_id uuid;
begin
  -- Get the first available org_id from hotel_settings
  select org_id into target_org_id from public.hotel_settings limit 1;
  
  if target_org_id is not null then
    -- Insert basic payment methods
    insert into public.payment_methods (org_id, code, label, kind, capture_mode, commission_percent, metadata) values
    (target_org_id,'CASH','Espèces','cash','passive',0,'{}'),
    (target_org_id,'CARD_VISA','Carte VISA','card','active',2.000,'{"scheme":"VISA"}'),
    (target_org_id,'CARD_AMEX','Carte AMEX','card','active',3.300,'{"scheme":"AMEX"}'),
    (target_org_id,'BANK','Virement bancaire','bank','passive',0,'{}'),
    (target_org_id,'CHEQUE','Chèque','cheque','passive',0,'{}'),
    (target_org_id,'DEBTOR','Débiteur','debtor','passive',0,'{"post_to_accounts_receivable":true}'),
    (target_org_id,'DEPOSIT','Arrhes','deposit','passive',0,'{}'),
    (target_org_id,'PAYTELL','Paytell (garantie)','paytell','passive',0,'{}'),
    (target_org_id,'DISBURS','Débours (avance)','disbursement','passive',0,'{}'),
    (target_org_id,'MM_OM','Orange Money','mobile','passive',1.200,'{"requires_reference":true}'),
    (target_org_id,'MM_MTN','MTN MoMo','mobile','passive',1.200,'{"requires_reference":true}'),
    (target_org_id,'MM_MOOV','Moov Money','mobile','passive',1.200,'{"requires_reference":true}'),
    (target_org_id,'MM_WAVE','Wave','mobile','passive',1.000,'{"requires_reference":true}')
    on conflict (org_id, code) do nothing;

    -- Insert mobile money accounts
    insert into public.mobile_money_accounts (org_id, provider, display_name, wallet_msisdn, merchant_id, api_provider, settlement_account, active) values
    (target_org_id,'OrangeMoney','OM Réception','2250700000000',null,'CinetPay','SGCI-123456',true),
    (target_org_id,'MTN','MTN Réception','2250500000000',null,'CinetPay','SGCI-123456',true),
    (target_org_id,'Moov','Moov Réception','2250100000000',null,null,'SGCI-123456',true),
    (target_org_id,'Wave','Wave Réception','2250100000001',null,'Wave','SGCI-123456',true)
    on conflict do nothing;

    -- Insert currencies
    insert into public.currencies (org_id, code, label, rate_to_base, is_base, active) values
    (target_org_id,'XOF','Franc CFA (BCEAO)',1,true,true),
    (target_org_id,'EUR','Euro',655.957,false,true),
    (target_org_id,'USD','US Dollar',610,false,true)
    on conflict (org_id, code) do nothing;
  end if;
end $$;
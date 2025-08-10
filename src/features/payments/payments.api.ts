import { supabase } from "@/integrations/supabase/client";

export const listPaymentMethods = (orgId: string) =>
  (supabase as any).from("payment_methods").select("*").eq("org_id", orgId).order("label");

export const upsertPaymentMethod = (payload: any) =>
  (supabase as any).from("payment_methods").upsert(payload).select();

export const deletePaymentMethod = (id: string) =>
  (supabase as any).from("payment_methods").delete().eq("id", id);

export const listTerminals = (orgId: string) =>
  (supabase as any).from("payment_terminals").select("*").eq("org_id", orgId).order("name");

export const upsertTerminal = (payload: any) =>
  (supabase as any).from("payment_terminals").upsert(payload).select();

export const deleteTerminal = (id: string) =>
  (supabase as any).from("payment_terminals").delete().eq("id", id);

export const listCurrencies = (orgId: string) =>
  (supabase as any).from("currencies").select("*").eq("org_id", orgId).order("is_base", { ascending: false }).order("code");

export const upsertCurrency = (payload: any) =>
  (supabase as any).from("currencies").upsert(payload).select();

export const deleteCurrency = (id: string) =>
  (supabase as any).from("currencies").delete().eq("id", id);
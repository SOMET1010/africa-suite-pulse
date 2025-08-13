/**
 * Types pour le module Cardex
 */

import type { ReservationService } from './billing';

export interface FolioSummary {
  folio_number: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  description?: string;
  total_debit: number;
  total_credit: number;
  balance: number;
  item_count: number;
  last_activity?: string;
}

export interface CardexLine {
  id: string;
  date: string;
  folio_number: number;
  service_code: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'service' | 'payment' | 'adjustment' | 'accommodation';
  invoice_number?: string;
  user_name?: string;
}

export interface CardexOverview {
  reservation_id: string;
  guest_name: string;
  room_number?: string;
  check_in: string;
  check_out: string;
  total_debit: number;
  total_credit: number;
  total_balance: number;
  folios: FolioSummary[];
  lines: CardexLine[];
  payment_summary: {
    total_paid: number;
    pending_amount: number;
    last_payment?: string;
  };
}

export interface CardexFilters {
  folio_number?: number;
  date_from?: string;
  date_to?: string;
  type?: 'service' | 'payment' | 'adjustment' | 'accommodation';
  show_paid_only?: boolean;
}

export interface CardexPayment {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  date: string;
  folio_number: number;
  user_name?: string;
}

export interface QuickPostingItem {
  service_id: string;
  service_code: string;
  service_label: string;
  quantity: number;
  unit_price: number;
  folio_number: number;
  description?: string;
}

export interface FolioTransfer {
  from_folio: number;
  to_folio: number;
  amount: number;
  line_ids: string[];
  reason?: string;
}

export interface CardexSettings {
  auto_post_accommodation: boolean;
  default_folio_accommodation: number;
  default_folio_extras: number;
  show_zero_folios: boolean;
  group_by_date: boolean;
}
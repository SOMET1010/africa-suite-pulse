export interface InvoiceItem {
  id: string;
  invoice_id: string;
  org_id: string;
  service_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  folio_number: number;
  billing_condition: string;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItemInsert {
  invoice_id: string;
  service_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  folio_number: number;
  billing_condition: string;
  valid_from?: string;
  valid_until?: string;
}

export interface ReservationService {
  id: string;
  reservation_id: string;
  org_id: string;
  service_id: string;
  arrangement_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  folio_number: number;
  billing_condition: 'daily' | 'stay' | 'weekly' | 'monthly';
  valid_from: string;
  valid_until: string;
  is_applied: boolean;
  created_at: string;
  updated_at: string;
  service?: {
    code: string;
    label: string;
    price?: number;
  };
}

export interface ReservationServiceInsert {
  reservation_id: string;
  service_id: string;
  arrangement_id?: string;
  quantity: number;
  unit_price: number;
  folio_number: number;
  billing_condition: 'daily' | 'stay' | 'weekly' | 'monthly';
  valid_from: string;
  valid_until: string;
}

export interface FolioDefinition {
  number: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  description?: string;
}

export const FOLIO_DEFINITIONS: FolioDefinition[] = [
  { number: 1, label: 'Principal', description: 'Folio principal (hébergement)' },
  { number: 2, label: 'Extras', description: 'Prestations supplémentaires' },
  { number: 3, label: 'Téléphone', description: 'Communications téléphoniques' },
  { number: 4, label: 'Mini-bar', description: 'Consommations mini-bar' },
  { number: 5, label: 'Blanchisserie', description: 'Services de blanchisserie' },
  { number: 6, label: 'Divers', description: 'Autres prestations' },
];

export const BILLING_CONDITIONS = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'stay', label: 'Séjour complet' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
] as const;

export type GroupBillingMode = 'individual' | 'master' | 'duplicate';

export const GROUP_BILLING_MODES = [
  { 
    value: 'individual' as const, 
    label: 'Individuel', 
    description: 'Chaque membre du groupe a sa propre facture' 
  },
  { 
    value: 'master' as const, 
    label: 'Facture maître (N)', 
    description: 'Toutes les prestations sur une facture principale' 
  },
  { 
    value: 'duplicate' as const, 
    label: 'Duplication (D)', 
    description: 'Prestations dupliquées sur chaque facture membre' 
  },
];
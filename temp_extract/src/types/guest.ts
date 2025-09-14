/**
 * Types pour la gestion des clients/hôtes
 */

export interface Guest {
  id: string;
  org_id: string;
  
  // Personal Information
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;
  
  // Identity Documents
  document_type?: string;
  document_number?: string;
  document_expiry?: string;
  document_issuing_country?: string;
  
  // Address Information
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  
  // Business/Company Info
  company_name?: string;
  company_address?: string;
  tax_id?: string;
  
  // Preferences and Notes
  preferences?: any;
  special_requests?: string;
  notes?: string;
  
  // Classification
  guest_type: string;
  vip_status: boolean;
  
  // Contact Preferences
  marketing_consent: boolean;
  preferred_communication: string;
  
  // System Fields
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface GuestInsert extends Omit<Guest, 'id' | 'created_at' | 'updated_at'> {}

export interface GuestUpdate extends Partial<Omit<Guest, 'id' | 'org_id' | 'created_at' | 'updated_at'>> {}

export interface GuestStayHistory {
  guest_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  reservation_id?: string;
  reservation_reference?: string;
  date_arrival?: string;
  date_departure?: string;
  reservation_status?: string;
  adults?: number;
  children?: number;
  rate_total?: number;
  room_number?: string;
  room_type?: string;
  nights_count?: number;
  invoice_number?: string;
  invoice_total?: number;
}

export interface GuestFilters {
  search?: string;
  guest_type?: string;
  vip_status?: boolean;
  nationality?: string;
  has_future_reservations?: boolean;
}
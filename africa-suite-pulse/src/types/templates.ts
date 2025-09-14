
// Types pour le gestionnaire de templates de documents
export type TemplateType = 'invoice' | 'receipt' | 'reminder' | 'pos_ticket' | 'pos_receipt' | 'kitchen_order' | 'email' | 'report';

export interface TemplateHeader {
  show_logo: boolean;
  logo_url?: string;
  logo_size: 'small' | 'medium' | 'large';
  logo_position: 'left' | 'center' | 'right';
  show_company_info: boolean;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
  custom_text?: string;
}

export interface TemplateFooter {
  show_legal_info: boolean;
  legal_text?: string;
  show_bank_info: boolean;
  bank_details?: string;
  show_tax_info: boolean;
  tax_number?: string;
  commercial_registry?: string;
  custom_text?: string;
  show_page_numbers: boolean;
}

export interface TemplateQRCode {
  enabled: boolean;
  content: 'document_url' | 'verification_url' | 'payment_url' | 'custom';
  custom_content?: string;
  position: 'header' | 'footer' | 'top_right' | 'bottom_right';
  size: 'small' | 'medium' | 'large';
}

export interface TemplateStyle {
  font_family: 'inter' | 'roboto' | 'arial' | 'times';
  font_size: 'small' | 'medium' | 'large';
  primary_color: string;
  secondary_color: string;
  text_color: string;
  background_color: string;
  border_color: string;
  table_style: 'minimal' | 'bordered' | 'striped' | 'elegant';
}

export interface TemplateContent {
  title?: string;
  subtitle?: string;
  show_date: boolean;
  show_reference: boolean;
  show_qr_code: boolean;
  custom_fields: TemplateCustomField[];
  sections: TemplateSection[];
}

export interface TemplateCustomField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
  required: boolean;
  default_value?: string;
  position: 'header' | 'footer' | 'before_items' | 'after_items';
}

export interface TemplateSection {
  id: string;
  title: string;
  type: 'table' | 'text' | 'summary' | 'totals';
  visible: boolean;
  order: number;
  config: Record<string, any>;
}

export interface DocumentTemplate {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  type: TemplateType;
  is_default: boolean;
  is_active: boolean;
  header: TemplateHeader;
  footer: TemplateFooter;
  qr_code: TemplateQRCode;
  style: TemplateStyle;
  content: TemplateContent;
  variables?: string[];
  version?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DocumentTemplateInsert {
  name: string;
  description?: string;
  type: TemplateType;
  is_default?: boolean;
  header: TemplateHeader;
  footer: TemplateFooter;
  qr_code: TemplateQRCode;
  style: TemplateStyle;
  content: TemplateContent;
}

// Templates par défaut pour chaque type de document
export const DEFAULT_TEMPLATES: Record<TemplateType, Partial<DocumentTemplate>> = {
  invoice: {
    name: 'Facture Standard',
    type: 'invoice',
    header: {
      show_logo: true,
      logo_size: 'medium',
      logo_position: 'left',
      show_company_info: true,
    },
    footer: {
      show_legal_info: true,
      show_bank_info: true,
      show_tax_info: true,
      show_page_numbers: true,
    },
    qr_code: {
      enabled: true,
      content: 'verification_url',
      position: 'top_right',
      size: 'medium',
    },
    style: {
      font_family: 'inter',
      font_size: 'medium',
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      text_color: '#1e293b',
      background_color: '#ffffff',
      border_color: '#e2e8f0',
      table_style: 'bordered',
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: true,
      custom_fields: [],
      sections: [],
    },
  },
  receipt: {
    name: 'Reçu Standard',
    type: 'receipt',
    header: {
      show_logo: true,
      logo_size: 'small',
      logo_position: 'center',
      show_company_info: true,
    },
    footer: {
      show_legal_info: false,
      show_bank_info: false,
      show_tax_info: true,
      show_page_numbers: false,
    },
    qr_code: {
      enabled: true,
      content: 'verification_url',
      position: 'bottom_right',
      size: 'small',
    },
    style: {
      font_family: 'inter',
      font_size: 'medium',
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      text_color: '#1e293b',
      background_color: '#ffffff',
      border_color: '#e2e8f0',
      table_style: 'minimal',
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: true,
      custom_fields: [],
      sections: [],
    },
  },
  reminder: {
    name: 'Relance Standard',
    type: 'reminder',
    header: {
      show_logo: true,
      logo_size: 'medium',
      logo_position: 'left',
      show_company_info: true,
    },
    footer: {
      show_legal_info: true,
      show_bank_info: true,
      show_tax_info: false,
      show_page_numbers: true,
    },
    qr_code: {
      enabled: true,
      content: 'payment_url',
      position: 'footer',
      size: 'medium',
    },
    style: {
      font_family: 'inter',
      font_size: 'medium',
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      text_color: '#1e293b',
      background_color: '#ffffff',
      border_color: '#e2e8f0',
      table_style: 'bordered',
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: true,
      custom_fields: [],
      sections: [],
    },
  },
  pos_ticket: {
    name: 'Ticket de Caisse',
    type: 'pos_ticket',
    header: {
      show_logo: true,
      logo_size: 'small',
      logo_position: 'center',
      show_company_info: true,
    },
    footer: {
      show_legal_info: false,
      show_bank_info: false,
      show_tax_info: true,
      show_page_numbers: false,
    },
    qr_code: {
      enabled: true,
      content: 'verification_url',
      position: 'footer',
      size: 'small',
    },
    style: {
      font_family: 'roboto',
      font_size: 'small',
      primary_color: '#000000',
      secondary_color: '#666666',
      text_color: '#000000',
      background_color: '#ffffff',
      border_color: '#000000',
      table_style: 'minimal',
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: true,
      custom_fields: [],
      sections: [],
    },
  },
  pos_receipt: {
    name: 'Ticket de Caisse POS',
    type: 'pos_receipt',
    header: {
      show_logo: true,
      logo_size: 'small',
      logo_position: 'center',
      show_company_info: true,
    },
    footer: {
      show_legal_info: false,
      show_bank_info: false,
      show_tax_info: true,
      show_page_numbers: false,
    },
    qr_code: {
      enabled: true,
      content: 'verification_url',
      position: 'footer',
      size: 'small',
    },
    style: {
      font_family: 'roboto',
      font_size: 'small',
      primary_color: '#000000',
      secondary_color: '#666666',
      text_color: '#000000',
      background_color: '#ffffff',
      border_color: '#000000',
      table_style: 'minimal',
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: true,
      custom_fields: [],
      sections: [],
    },
  },
  kitchen_order: {
    name: 'Bon de Commande Cuisine',
    type: 'kitchen_order',
    header: {
      show_logo: false,
      logo_size: 'small',
      logo_position: 'center',
      show_company_info: false,
    },
    footer: {
      show_legal_info: false,
      show_bank_info: false,
      show_tax_info: false,
      show_page_numbers: false,
    },
    qr_code: {
      enabled: false,
      content: 'custom',
      position: 'header',
      size: 'small',
    },
    style: {
      font_family: 'roboto',
      font_size: 'large',
      primary_color: '#000000',
      secondary_color: '#666666',
      text_color: '#000000',
      background_color: '#ffffff',
      border_color: '#ff0000',
      table_style: 'bordered',
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: false,
      custom_fields: [],
      sections: [],
    },
  },
  email: {
    name: 'Email Standard',
    type: 'email',
    header: {
      show_logo: true,
      logo_size: 'medium',
      logo_position: 'center',
      show_company_info: true,
    },
    footer: {
      show_legal_info: true,
      show_bank_info: false,
      show_tax_info: false,
      show_page_numbers: false,
    },
    qr_code: {
      enabled: false,
      content: 'document_url',
      position: 'footer',
      size: 'medium',
    },
    style: {
      font_family: 'inter',
      font_size: 'medium',
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      text_color: '#1e293b',
      background_color: '#ffffff',
      border_color: '#e2e8f0',
      table_style: 'minimal',
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: false,
      custom_fields: [],
      sections: [],
    },
  },
  report: {
    name: 'Rapport Standard',
    type: 'report',
    header: {
      show_logo: true,
      logo_size: 'medium',
      logo_position: 'left',
      show_company_info: true,
    },
    footer: {
      show_legal_info: false,
      show_bank_info: false,
      show_tax_info: false,
      show_page_numbers: true,
    },
    qr_code: {
      enabled: true,
      content: 'verification_url',
      position: 'top_right',
      size: 'small',
    },
    style: {
      font_family: 'inter',
      font_size: 'medium',
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      text_color: '#1e293b',
      background_color: '#ffffff',
      border_color: '#e2e8f0',
      table_style: 'bordered',
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: true,
      custom_fields: [],
      sections: [],
    },
  },
};

export const TEMPLATE_TYPES: { value: TemplateType; label: string; description: string }[] = [
  { value: 'invoice', label: 'Facture', description: 'Factures clients et fournisseurs' },
  { value: 'receipt', label: 'Reçu', description: 'Reçus de paiement et accusés' },
  { value: 'reminder', label: 'Relance', description: 'Lettres de relance de paiement' },
  { value: 'pos_ticket', label: 'Ticket de caisse', description: 'Tickets de caisse POS' },
  { value: 'pos_receipt', label: 'Reçu POS', description: 'Reçus de point de vente' },
  { value: 'kitchen_order', label: 'Bon cuisine', description: 'Bons de commande pour la cuisine' },
  { value: 'email', label: 'Email', description: 'Templates d\'emails automatiques' },
  { value: 'report', label: 'Rapport', description: 'Rapports et états de gestion' },
];

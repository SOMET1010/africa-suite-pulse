import type { DocumentTemplate } from '@/types/templates';

export const POSTemplatePresets: Omit<DocumentTemplate, 'id' | 'org_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: "Ticket de Caisse Standard",
    description: "Template standard pour tickets de caisse POS",
    type: "pos_receipt",
    is_default: true,
    is_active: true,
    header: {
      show_logo: true,
      logo_size: "small",
      logo_position: "center",
      show_company_info: true,
      custom_text: "Bienvenue dans notre établissement"
    },
    footer: {
      show_legal_info: false,
      show_bank_info: false,
      show_tax_info: true,
      show_page_numbers: false,
      custom_text: "Merci de votre visite !\nÀ bientôt !"
    },
    qr_code: {
      enabled: true,
      content: "verification_url",
      position: "footer",
      size: "medium"
    },
    style: {
      font_family: "roboto",
      font_size: "small",
      primary_color: "hsl(var(--foreground))",
      secondary_color: "hsl(var(--muted-foreground))",
      text_color: "hsl(var(--foreground))",
      background_color: "hsl(var(--background))",
      border_color: "hsl(var(--border))",
      table_style: "minimal"
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: true,
      custom_fields: [],
      sections: []
    }
  },
  {
    name: "Reçu de Paiement",
    description: "Template simple pour reçus de paiement",
    type: "pos_receipt",
    is_default: false,
    is_active: true,
    header: {
      show_logo: true,
      logo_size: "small",
      logo_position: "center",
      show_company_info: true,
      custom_text: "REÇU DE PAIEMENT"
    },
    footer: {
      show_legal_info: false,
      show_bank_info: false,
      show_tax_info: false,
      show_page_numbers: false,
      custom_text: "Document non contractuel"
    },
    qr_code: {
      enabled: true,
      content: "verification_url",
      position: "footer",
      size: "small"
    },
    style: {
      font_family: "roboto",
      font_size: "small",
      primary_color: "hsl(var(--foreground))",
      secondary_color: "hsl(var(--muted-foreground))",
      text_color: "hsl(var(--foreground))",
      background_color: "hsl(var(--background))",
      border_color: "hsl(var(--border))",
      table_style: "minimal"
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: true,
      custom_fields: [],
      sections: []
    }
  },
  {
    name: "Bon de Commande Cuisine",
    description: "Template optimisé pour la cuisine",
    type: "kitchen_order",
    is_default: false,
    is_active: true,
    header: {
      show_logo: false,
      logo_size: "small",
      logo_position: "center",
      show_company_info: false,
      custom_text: "COMMANDE CUISINE"
    },
    footer: {
      show_legal_info: false,
      show_bank_info: false,
      show_tax_info: false,
      show_page_numbers: false,
      custom_text: "Heure de préparation estimée: 15 min"
    },
    qr_code: {
      enabled: false,
      content: "custom",
      position: "header",
      size: "small"
    },
    style: {
      font_family: "roboto",
      font_size: "large",
      primary_color: "hsl(var(--foreground))",
      secondary_color: "hsl(var(--muted-foreground))",
      text_color: "hsl(var(--foreground))",
      background_color: "hsl(var(--background))",
      border_color: "hsl(var(--destructive))",
      table_style: "bordered"
    },
    content: {
      show_date: true,
      show_reference: true,
      show_qr_code: false,
      custom_fields: [],
      sections: []
    }
  }
];